<?php

namespace App\Repository;

use App\Entity\Projet; // Assurez-vous que le chemin vers votre entité Projet est correct
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Projet>
 *
 * @method Projet|null find($id, $lockMode = null, $lockVersion = null)
 * @method Projet|null findOneBy(array $criteria, array $orderBy = null)
 * @method Projet[]    findAll()
 * @method Projet[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ProjetRepository extends ServiceEntityRepository
{
    /**
     * Constructeur standard pour un Repository Symfony/Doctrine.
     * Il connecte le repository à l'entité Projet via le ManagerRegistry.
     *
     * @param ManagerRegistry $registry
     */
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Projet::class);
    }

    /**
     * Fonction d'exemple pour sauvegarder une entité Projet.
     *
     * @param Projet $entity
     * @param bool $flush
     * @return void
     */
    public function save(Projet $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    /**
     * Fonction d'exemple pour supprimer une entité Projet.
     *
     * @param Projet $entity
     * @param bool $flush
     * @return void
     */
    public function remove(Projet $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    // Vous pouvez ajouter ici des méthodes de recherche personnalisées, par exemple:
    
    /**
     * @return Projet[] Returns an array of Projet objects filtered by user ID
     */
    public function findByUser(int $userId): array
    {
        return $this->createQueryBuilder('p')
            ->andWhere('p.user = :val') // Assurez-vous que votre entité Projet a un champ 'user'
            ->setParameter('val', $userId)
            ->orderBy('p.createdAt', 'DESC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult()
        ;
    }
}