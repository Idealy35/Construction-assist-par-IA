<?php

namespace App\Repository;

use App\Entity\DiscussionIA; // Assurez-vous d'avoir cette entité créée
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<DiscussionIA>
 *
 * @method DiscussionIA|null find($id, $lockMode = null, $lockVersion = null)
 * @method DiscussionIA|null findOneBy(array $criteria, array $orderBy = null)
 * @method DiscussionIA[]    findAll()
 * @method DiscussionIA[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class DiscussionIARepository extends ServiceEntityRepository
{
    /**
     * Constructeur standard pour l'injection de Doctrine.
     * @param ManagerRegistry $registry
     */
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, DiscussionIA::class);
    }

    /**
     * Enregistre ou met à jour une entité DiscussionIA.
     * @param DiscussionIA $entity
     * @param bool $flush
     */
    public function save(DiscussionIA $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    /**
     * Supprime une entité DiscussionIA.
     * @param DiscussionIA $entity
     * @param bool $flush
     */
    public function remove(DiscussionIA $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    /**
     * Récupère toutes les discussions d'un utilisateur, triées par date récente.
     * * @param int $userId
     * @return DiscussionIA[]
     */
    public function findDiscussionsByUser(int $userId): array
    {
        return $this->createQueryBuilder('d')
            // Assurez-vous que l'entité DiscussionIA a une relation 'utilisateur'
            ->andWhere('d.utilisateur = :val') 
            ->setParameter('val', $userId)
            ->orderBy('d.dateMiseAJour', 'DESC') // Supposant un champ 'dateMiseAJour'
            ->getQuery()
            ->getResult()
        ;
    }
}