<?php

// backend/src/Controller/SecurityController.php



namespace App\Controller;



use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

use Symfony\Component\HttpFoundation\Response;

use Symfony\Component\HttpFoundation\Request;

use Symfony\Component\Routing\Attribute\Route;

use Symfony\Component\Security\Http\Attribute\IsGranted;

use Doctrine\ORM\EntityManagerInterface;

use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;



class SecurityController extends AbstractController

{

    /**

     * Cette fonction est le point d'entrée pour la connexion JWT.

     * Elle est interceptée par le firewall 'login' dans security.yaml.

     * Le code à l'intérieur ne devrait jamais être atteint si le firewall est bien configuré.

     */

    #[Route('/api/login_check', name: 'api_login_check', methods: ['POST'])]

    public function login(): Response

    {

        // On renvoie une exception, car le bundle Lexik gère la réponse SUCCESS (token) ou FAILURE.

        // Cette route existe juste pour que Symfony la reconnaisse.

        throw new \Exception('Ceci ne devrait jamais être atteint ! Le firewall JWT gère le processus.');

    }



    /**

     * Endpoint pour vérifier l'état d'authentification (utile pour le frontend)

     */

    #[Route('/api/user/me', name: 'api_user_me', methods: ['GET'])]

    #[IsGranted('IS_AUTHENTICATED_FULLY')]

    public function me(): Response

    {

        /** @var \App\Entity\Utilisateur $user */

        $user = $this->getUser();



        return $this->json([

            'id' => $user->getId(),

            'email' => $user->getEmail(),

            'nom' => $user->getNom(),

            'roles' => $user->getRoles(),

        ]);

    }



    #[Route('/api/dev_login', name: 'api_dev_login', methods: ['POST'])]

    public function devLogin(Request $request, EntityManagerInterface $em, UserPasswordHasherInterface $hasher, JWTTokenManagerInterface $jwtManager): Response

    {

        $data = json_decode($request->getContent(), true) ?? [];
        $email = $data['email'] ?? $request->request->get('email');
        $password = $data['password'] ?? $request->request->get('password');



        if (!$email || !$password) {

            return $this->json(['error' => 'Email et mot de passe requis'], Response::HTTP_BAD_REQUEST);

        }



        $user = $em->getRepository(\App\Entity\Utilisateur::class)->findOneBy(['email' => $email]);

        if (!$user) {

            return $this->json(['error' => 'Identifiants invalides'], Response::HTTP_UNAUTHORIZED);

        }



        if (!$hasher->isPasswordValid($user, $password)) {
            return $this->json(['error' => 'Identifiants invalides'], Response::HTTP_UNAUTHORIZED);
        }

        try {
            try {
                $jwt = $jwtManager->create($user);
                return $this->json(['token' => $jwt]);
            } catch (\Throwable $inner) {
                $secret = $_ENV['JWT_HMAC_SECRET'] ?? $_SERVER['JWT_HMAC_SECRET'] ?? 'dev-super-secret-change-me-2025';
                if ($secret === '') {
                    throw new \RuntimeException('JWT_HMAC_SECRET manquant');
                }
                $header = ['alg' => 'HS256', 'typ' => 'JWT'];
                $now = time();
                $payload = [
                    'username' => $user->getUserIdentifier(),
                    'iat' => $now,
                    'exp' => $now + 3600,
                ];
                $b64 = fn($d) => rtrim(strtr(base64_encode(json_encode($d)), '+/', '-_'), '=');
                $sign = fn($data, $key) => rtrim(strtr(base64_encode(hash_hmac('sha256', $data, $key, true)), '+/', '-_'), '=');
                $segments = $b64($header) . '.' . $b64($payload);
                $jwt = $segments . '.' . $sign($segments, $secret);
                return $this->json(['token' => $jwt]);
            }
        } catch (\Throwable $e) {
            return $this->json([
                'error' => 'Échec de génération du token',
                'details' => $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

    }



    #[Route('/api/dev_signup', name: 'api_dev_signup', methods: ['POST'])]

    public function devSignup(Request $request, EntityManagerInterface $em, UserPasswordHasherInterface $hasher): Response

    {

        $data = json_decode($request->getContent(), true) ?? [];

        $name = $data['name'] ?? null;

        $email = $data['email'] ?? null;

        $password = $data['password'] ?? null;



        if (!$name || !$email || !$password) {

            return $this->json(['error' => 'Nom, email et mot de passe requis'], Response::HTTP_BAD_REQUEST);

        }



        $repo = $em->getRepository(\App\Entity\Utilisateur::class);

        if ($repo->findOneBy(['email' => $email])) {

            return $this->json(['error' => 'Un compte existe déjà avec cet email'], Response::HTTP_CONFLICT);

        }



        $user = new \App\Entity\Utilisateur();

        $user->setEmail($email);

        $user->setNom($name);

        $user->setDateInscription(new \DateTimeImmutable());

        $user->setRoles(['ROLE_USER']);

        $user->setPassword($hasher->hashPassword($user, $password));



        $em->persist($user);

        $em->flush();



        return $this->json(['status' => 'created']);

    }

}
