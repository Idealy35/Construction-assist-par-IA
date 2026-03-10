<?php

namespace App\Service;

use Symfony\Component\HttpClient\NativeHttpClient;
use Symfony\Component\HttpClient\HttpClient;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class GeminiApiService
{
    private HttpClientInterface $client;
    private string $apiKey;
    private string $model;
    
    // Utilisation de v1beta pour assurer la compatibilité multimodale
    private string $apiBase = 'https://generativelanguage.googleapis.com/v1beta/models/';

    public function __construct(
        string $geminiApiKey, 
        string $geminiModel = 'gemini-1.5-flash', // Utiliser le nom court sans "-latest"
        ?string $cafile = null, 
        string $appEnv = 'prod', 
        bool $disableVerifyDev = false
    ) {
        $options = [];
        $hasCa = is_string($cafile) && $cafile !== '' && file_exists($cafile);
        
        if ($hasCa && !($disableVerifyDev && strtolower($appEnv) === 'dev')) {
            $options['cafile'] = $cafile;
            @ini_set('openssl.cafile', $cafile);
            @ini_set('curl.cainfo', $cafile);
            $this->client = new NativeHttpClient($options);
        } else {
            if (strtolower($appEnv) === 'dev') {
                $options['verify_peer'] = false;
                $options['verify_host'] = false;
            }
            $this->client = HttpClient::create($options);
        }
        
        $this->apiKey = $geminiApiKey;
        $this->model = $geminiModel;
    }

    /**
     * Envoie une requête multimodale (texte et image) à Gemini.
     */
    public function analyzeContent(string $prompt, ?UploadedFile $imageFile = null): array
    {
        $prompt = $this->sanitizeUtf8($prompt);
        
        // Structure de base pour Gemini
        $contents = [
            'parts' => [
                ['text' => $prompt]
            ]
        ];

        if ($imageFile) {
            $data = @file_get_contents($imageFile->getPathname());
            if ($data !== false) {
                $base64Image = base64_encode($data);
                $mimeType = $this->detectMimeType($imageFile);

                // CORRECTION : Utilisation de inline_data (snake_case)
                $contents['parts'][] = [
                    'inline_data' => [
                        'mime_type' => $mimeType,
                        'data' => $base64Image,
                    ]
                ];
            }
        }

        try {
            // Vérification de la clé
            if (!$this->apiKey || strtolower(trim($this->apiKey)) === 'dev') {
                throw new \RuntimeException("Clé API manquante ou configurée sur 'dev'.");
            }

            // Construction de l'URL avec le modèle correct
            $endpoint = $this->apiBase . $this->model . ':generateContent?key=' . $this->apiKey;

            $response = $this->client->request('POST', $endpoint, [
                'headers' => [
                    'Content-Type' => 'application/json',
                ],
                'json' => [
                    'contents' => [$contents]
                ],
                'timeout' => 60, // Augmenté pour l'analyse d'image
            ]);

            $status = $response->getStatusCode();
            $data = $response->toArray(false);

            if ($status >= 400) {
                $errorMsg = $data['error']['message'] ?? 'Erreur inconnue';
                throw new \RuntimeException("Gemini API Error ($status): " . $errorMsg);
            }

            return $data;

        } catch (\Throwable $e) {
            // Log de l'erreur réelle pour le développeur
            error_log("Gemini API Error: " . $e->getMessage());
            return [
                'error' => true,
                'message' => $e->getMessage(),
                'status' => 'failed'
            ];
        }
    }

    private function sanitizeUtf8(string $s): string
    {
        if ($s === '') return $s;
        $enc = mb_detect_encoding($s, ['UTF-8','ISO-8859-1','Windows-1252'], true) ?: 'UTF-8';
        $u = ($enc === 'UTF-8') ? $s : @iconv($enc, 'UTF-8//IGNORE', $s);
        $u = preg_replace('/[^\x09\x0A\x0D\x20-\x7E\x{00A0}-\x{10FFFF}]/u', '', $u);
        return $u ?? '';
    }

    private function detectMimeType(UploadedFile $file): string
    {
        $clientType = $file->getClientMimeType();
        if (is_string($clientType) && $clientType !== '') {
            return $clientType;
        }

        $ext = strtolower($file->getClientOriginalExtension());
        $map = [
            'jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg',
            'png' => 'image/png', 'webp' => 'image/webp',
        ];

        return $map[$ext] ?? 'application/octet-stream';
    }
}