<?php

// backend/src/Controller/IaController.php



namespace App\Controller;



use App\Service\GeminiApiService;
use App\Service\EdenAiService;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

use Symfony\Component\HttpFoundation\File\UploadedFile;

use Symfony\Component\HttpFoundation\Request;

use Symfony\Component\HttpFoundation\Response;

use Symfony\Component\Routing\Annotation\Route;



class IaController extends AbstractController

{
    // Nécessite une authentification JWT

    #[Route('/api/ia/chat', name: 'api_ia_chat_multimodal', methods: ['POST'])]
    public function chat(Request $request, GeminiApiService $geminiService): Response
    {

        // Récupération des données depuis le FormData
        $prompt = (string)$request->request->get('prompt', '');
        $messagesRaw = (string)$request->request->get('messages', '');
        if ($prompt === '' && $messagesRaw !== '') {
            try {
                $decoded = json_decode($messagesRaw, true, 512, JSON_THROW_ON_ERROR);
                if (is_array($decoded)) {
                    for ($i = count($decoded) - 1; $i >= 0; $i--) {
                        $m = $decoded[$i] ?? null;
                        if (is_array($m) && strtolower((string)($m['role'] ?? '')) === 'user') {
                            $content = (string)($m['content'] ?? '');
                            if ($content !== '') { $prompt = $content; break; }
                        }
                    }
                }
            } catch (\Throwable $e) {
                // ignore decoding errors; will fall back to explicit prompt or image-only
            }
        }

        /** @var UploadedFile|null $imageFile */

        $imageFile = $request->files->get('image'); // Le nom 'image' est la clé du fichier dans le FormData du Front



        if (!$prompt && !$imageFile) {
            return $this->json(['error' => 'Veuillez fournir du texte, une image, ou les deux.'], Response::HTTP_BAD_REQUEST);
        }



        try {

            $geminiResponse = $geminiService->analyzeContent($prompt, $imageFile);



            if (isset($geminiResponse['error'])) {
                $env = $this->getParameter('kernel.environment');
                $responseText = $this->fallbackResponse($prompt);
                $payload = [
                    'response' => $responseText,
                    'status' => 'fallback',
                ];
                if ($env === 'dev') {
                    $payload['debug'] = [
                        'service_error' => $geminiResponse['error'],
                    ];
                }
                return $this->json($payload, Response::HTTP_OK);
            }



            $responseText = $geminiResponse['candidates'][0]['content']['parts'][0]['text'] ?? 'Aucune réponse de l\'IA reçue.';

            $payload = [

                'response' => $responseText,

                'status' => 'success'

            ];

            return $this->json($payload, Response::HTTP_OK);

        } catch (\Exception $e) {

            $env = $this->getParameter('kernel.environment');

            $payload = ['error' => 'Erreur de traitement IA: ' . $e->getMessage()];

            if ($env === 'dev') {

                $payload['debug'] = [

                    'exception' => get_class($e)

                ];

            }

            return $this->json($payload, Response::HTTP_INTERNAL_SERVER_ERROR);

        }

    }

    private function fallbackResponse(string $text): string
    {
        $t = mb_strtolower(trim($text));
        $lang = $this->detectLang($t);
        if ($t === '') {
            return 'Bonjour ! Je suis e‑construction AI Assistant. Décrivez votre besoin et je vous aide.';
        }
        if (preg_match('/\b(bonjour|salut|bonsoir|hello|hi)\b/u', $t)) {
            if ($lang === 'mg') {
                return 'Salama! Izaho no e‑construction AI Assistant. Azoko atao ny manampy amin’ny fanadihadiana planina, soso‑kevitra ary valiny amin’ny fanontaniana. Inona no ilainao ankehitriny?';
            }
            return 'Bonjour ! Je suis e‑construction AI Assistant. Je peux analyser vos plans, proposer des recommandations et répondre à vos questions. Que souhaitez‑vous faire ?';
        }
        if (preg_match('/\b(tradui|comment\s+se\s+dire)\b/u', $t)) {
            if ($lang === 'mg') {
                return 'Afaka manampy amin’ny fandikana aho raha ilaina. Lazao mazava ny fehezanteny sy ny fiteny kendrena.';
            }
            return 'Je peux traduire des phrases. Indiquez la phrase et la langue cible (ex: “Traduire « porte d\'entrée » en anglais”).';
        }
        if (preg_match('/\b(plan|maison|pi[eè]ce|surface|cuisine|salon|chambre)\b/u', $t)) {
            if ($lang === 'mg') {
                return 'Raha tsy misy motera IA: farito ny fepetra ilainao (velarantany, isan‑trano, fironana). Hanolotra firafitra fiasa aho miaraka amin’ny tanjaka sy fahalemena.';
            }
            return 'Sans moteur IA, voici un conseil: listez vos exigences (surface, pièces, orientation). Je proposerai un schéma fonctionnel avec points forts/faibles.';
        }
        if ($lang === 'mg') {
            return 'Tsy afaka nifandray tamin’ny motera IA aho. Hazavao mazava ny tanjonao (oh: mandinika planina, manatsara habaka, mandika fehezanteny) dia hitari‑dalana anao aho.';
        }
        return 'Je n’ai pas pu joindre le moteur IA. Précisez votre objectif (ex: analyser un plan, optimiser l’espace, traduire une note) et je vous guiderai.';
    }
    private function detectLang(string $t): ?string
    {
        if (preg_match('/\b(manahoana|ahoana|misaotra|azafady|salama|tsara|firy|trano|firenena|malagasy)\b/u', $t)) return 'mg';
        if (preg_match('/\b(bonjour|salut|merci|maison|pi[eè]ce|surface)\b/u', $t)) return 'fr';
        if (preg_match('/\b(hello|hi|please|thanks|house|room|surface)\b/u', $t)) return 'en';
        return null;
    }

    #[Route('/api/ia/describe-plan', name: 'api_ia_describe_plan', methods: ['POST'])]
    public function describePlan(Request $request, GeminiApiService $geminiService): Response
    {
        /** @var UploadedFile|null $imageFile */
        $imageFile = $request->files->get('image');
        $language = $request->request->get('language', 'fr');
        if (!$imageFile instanceof UploadedFile) {
            return $this->json(['error' => 'Image requise (clé: image)'], Response::HTTP_BAD_REQUEST);
        }
        // Utiliser Gemini: prompt vide mais image fournie, demander une description en langue souhaitée
        $prompt = $language === 'fr' ? 'Décris le plan architectural en français: points forts et points faibles.' : 'Describe the architectural plan: strengths and weaknesses.';
        $res = $geminiService->analyzeContent($prompt, $imageFile);
        $text = $res['candidates'][0]['content']['parts'][0]['text'] ?? '';
        if ($text === '') {
            return $this->json(['provider' => 'gemini', 'description' => '', 'error' => $res['error'] ?? ''], Response::HTTP_OK);
        }
        return $this->json(['provider' => 'gemini', 'description' => $text], Response::HTTP_OK);
    }

}
