<?php

namespace App\Controller;

use App\Repository\ProjetRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/projets')]
#[IsGranted('IS_AUTHENTICATED_FULLY')]
class ProjetController extends AbstractController
{
    #[Route('', name: 'projet_index', methods: ['GET'])]
    public function index(ProjetRepository $projetRepository): JsonResponse
    {
        $user = $this->getUser();
        $projets = $projetRepository->findBy(['utilisateur' => $user], ['dateCreation' => 'DESC']);
        return $this->json($projets, Response::HTTP_OK, [], ['groups' => 'projet:read']);
    }
}
