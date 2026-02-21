<?php
// backend/src/Entity/Message.php

namespace App\Entity;

use App\Repository\MessageRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass:MessageRepository::class)]
class Message
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['message:read', 'discussion:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'messages')]
    #[ORM\JoinColumn(nullable: false)]
    private ?DiscussionIA $discussionIA = null; // Chaque message appartient à une discussion

    #[ORM\Column(type: Types::TEXT)]
    #[Groups(['message:read', 'discussion:read'])]
    private ?string $contenu = null;

    #[ORM\Column]
    #[Groups(['message:read', 'discussion:read'])]
    private ?bool $isUser = null; // True si c'est un message de l'utilisateur, False si c'est de l'IA

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['message:read', 'discussion:read'])]
    private ?string $imageFilename = null; // Nom du fichier image si l'utilisateur a envoyé une image

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    #[Groups(['message:read', 'discussion:read'])]
    private ?\DateTimeImmutable $date = null;

    public function __construct()
    {
        $this->date = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getDiscussionIA(): ?DiscussionIA
    {
        return $this->discussionIA;
    }

    public function setDiscussionIA(?DiscussionIA $discussionIA): static
    {
        $this->discussionIA = $discussionIA;

        return $this;
    }

    public function getContenu(): ?string
    {
        return $this->contenu;
    }

    public function setContenu(string $contenu): static
    {
        $this->contenu = $contenu;

        return $this;
    }

    public function isIsUser(): ?bool
    {
        return $this->isUser;
    }

    public function setIsUser(bool $isUser): static
    {
        $this->isUser = $isUser;

        return $this;
    }

    public function getImageFilename(): ?string
    {
        return $this->imageFilename;
    }

    public function setImageFilename(?string $imageFilename): static
    {
        $this->imageFilename = $imageFilename;

        return $this;
    }

    public function getDate(): ?\DateTimeImmutable
    {
        return $this->date;
    }

    public function setDate(\DateTimeImmutable $date): static
    {
        $this->date = $date;

        return $this;
    }
}