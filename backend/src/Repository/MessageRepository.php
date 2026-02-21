<?php

namespace App\Repository;

use App\Entity\Message; // Assurez-vous d'avoir cette entité créée
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Message>
 *
 * @method Message|null find($id, $lockMode = null, $lockVersion = null)
 * @method Message|null findOneBy(array $criteria, array $orderBy = null)
 * @method Message[]    findAll()
 * @method Message[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class MessageRepository extends ServiceEntityRepository
{
    /**
     * Constructeur standard pour l'injection de Doctrine.
     * @param ManagerRegistry $registry
     */
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Message::class);
    }

    /**
     * Enregistre ou met à jour une entité Message.
     * @param Message $entity
     * @param bool $flush
     */
    public function save(Message $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    /**
     * Supprime une entité Message.
     * @param Message $entity
     * @param bool $flush
     */
    public function remove(Message $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }
    
    /**
     * Récupère tous les messages d'une discussion spécifique, triés chronologiquement.
     * * @param int $discussionId
     * @return Message[]
     */
    public function findMessagesByDiscussion(int $discussionId): array
    {
        return $this->createQueryBuilder('m')
            // Assurez-vous que l'entité Message a une relation 'discussion'
            ->andWhere('m.discussion = :val')
            ->setParameter('val', $discussionId)
            ->orderBy('m.dateEnvoi', 'ASC') // Supposant un champ 'dateEnvoi'
            ->getQuery()
            ->getResult()
        ;
    }
}