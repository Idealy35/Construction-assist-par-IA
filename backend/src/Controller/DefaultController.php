<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class DefaultController extends AbstractController
{
    #[Route('/', name: 'app_root')]
    public function index(): JsonResponse
    {
        return $this->json([
            'message' => 'Backend Symfony pour Construction-assist-par-IA est en ligne.',
            'status' => 'OK'
        ]);
    }
}
