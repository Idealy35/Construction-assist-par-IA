<?php
// backend/src/Command/AppCreateTestUserCommand.php

namespace App\Command;

use App\Entity\Utilisateur; // Assurez-vous que le nom de l'entité est correct
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[AsCommand(
    name: 'app:create-test-user',
    description: 'Crée un utilisateur de test dans la base de données',
)]
class AppCreateTestUserCommand extends Command
{
    private EntityManagerInterface $entityManager;
    private UserPasswordHasherInterface $passwordHasher;

    // Injection des dépendances par le constructeur
    public function __construct(EntityManagerInterface $entityManager, UserPasswordHasherInterface $passwordHasher)
    {
        $this->entityManager = $entityManager;
        $this->passwordHasher = $passwordHasher;
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $email = 'test@ia.com';
        $password = 'password'; // Mot de passe en clair pour le test

        $io->title('Création de l\'utilisateur de test');

        // 1. Vérifiez si l'utilisateur existe déjà
        if ($this->entityManager->getRepository(Utilisateur::class)->findOneBy(['email' => $email])) {
            $io->warning('L\'utilisateur ' . $email . ' existe déjà. Annulation.');
            return Command::SUCCESS;
        }

        // 2. Création de l'entité Utilisateur
        $user = new Utilisateur();
        $user->setEmail($email);
        $user->setNom('Test User');
        $user->setDateInscription(new \DateTimeImmutable());
        $user->setRoles(['ROLE_USER']);

        // 3. Hachage et définition du mot de passe
        $hashedPassword = $this->passwordHasher->hashPassword(
            $user,
            $password
        );
        $user->setPassword($hashedPassword);

        // 4. Sauvegarde dans la base de données
        $this->entityManager->persist($user);
        $this->entityManager->flush();

        $io->success("Utilisateur créé avec succès !");
        $io->text("Email: $email");
        $io->text("Mot de passe (pour la connexion): $password");
        $io->text('Base de données: projetia_db');

        return Command::SUCCESS;
    }
}