<?php
namespace App\Command;

use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:generate-jwt-keys',
    description: 'Génère une paire de clés RSA pour LexikJWT (dev)',
)]
class AppGenerateJwtKeysCommand extends Command
{
    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $passphrase = $_ENV['JWT_PASSPHRASE'] ?? $_SERVER['JWT_PASSPHRASE'] ?? (getenv('JWT_PASSPHRASE') ?: '');
        $projectDir = dirname(__DIR__, 2);
        $jwtDir = $projectDir . DIRECTORY_SEPARATOR . 'config' . DIRECTORY_SEPARATOR . 'jwt';
        $privatePath = $jwtDir . DIRECTORY_SEPARATOR . 'private.pem';
        $publicPath = $jwtDir . DIRECTORY_SEPARATOR . 'public.pem';

        if (!function_exists('openssl_pkey_new')) {
            $io->error('L’extension OpenSSL PHP n’est pas disponible.');
            return Command::FAILURE;
        }

        if (!is_dir($jwtDir) && !mkdir($jwtDir, 0775, true) && !is_dir($jwtDir)) {
            $io->error('Impossible de créer le répertoire: ' . $jwtDir);
            return Command::FAILURE;
        }

        $io->title('Génération des clés JWT');

        $config = [
            'private_key_bits' => 2048,
            'private_key_type' => OPENSSL_KEYTYPE_RSA,
        ];
        if (strtoupper(PHP_OS_FAMILY) === 'Windows') {
            $defaultConf = 'C:\\php\\extras\\ssl\\openssl.cnf';
            $envConf = getenv('OPENSSL_CONF') ?: '';
            $confPath = is_file($envConf) ? $envConf : (is_file($defaultConf) ? $defaultConf : '');
            if ($confPath !== '') {
                $config['config'] = $confPath;
                putenv('OPENSSL_CONF=' . $confPath);
            }

            $randDir = getenv('LOCALAPPDATA') ?: sys_get_temp_dir();
            $randFile = rtrim($randDir, '\\\\/') . DIRECTORY_SEPARATOR . 'openssl.rnd';
            @file_put_contents($randFile, random_bytes(256));
            putenv('RANDFILE=' . $randFile);
        }

        if (!isset($config['config'])) {
            $localConf = $projectDir . DIRECTORY_SEPARATOR . 'config' . DIRECTORY_SEPARATOR . 'openssl.cnf';
            if (is_file($localConf)) {
                $config['config'] = $localConf;
                putenv('OPENSSL_CONF=' . $localConf);
            }
        }

        $res = openssl_pkey_new($config);
        if ($res === false) {
            $err = function_exists('openssl_error_string') ? openssl_error_string() : '';
            $io->error('Échec de la création de la clé privée RSA.' . ($err ? ' Détails: ' . $err : ''));
            return Command::FAILURE;
        }

        $privateKey = '';
        $options = [];
        if (isset($config['config'])) {
            $options['config'] = $config['config'];
        }
        $exportOk = openssl_pkey_export($res, $privateKey, ($passphrase !== '' ? $passphrase : null), $options);
        if (!$exportOk) {
            $io->error('Échec de l’export de la clé privée.');
            return Command::FAILURE;
        }

        $details = openssl_pkey_get_details($res);
        $publicKey = $details['key'] ?? null;
        if (!$publicKey) {
            $io->error('Échec de l’obtention de la clé publique.');
            return Command::FAILURE;
        }

        if (file_put_contents($privatePath, $privateKey) === false) {
            $io->error('Impossible d’écrire la clé privée: ' . $privatePath);
            return Command::FAILURE;
        }
        if (file_put_contents($publicPath, $publicKey) === false) {
            $io->error('Impossible d’écrire la clé publique: ' . $publicPath);
            return Command::FAILURE;
        }

        @chmod($privatePath, 0600);
        @chmod($publicPath, 0644);

        $io->success('Clés JWT générées dans ' . $jwtDir);

        return Command::SUCCESS;
    }
}
