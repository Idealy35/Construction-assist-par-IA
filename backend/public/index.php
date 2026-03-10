<?php

use App\Kernel;
use Symfony\Component\ErrorHandler\Debug;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Dotenv\Dotenv;

require dirname(__DIR__) . '/vendor/autoload.php';

// Augmenter le délai d'exécution global pour Windows / Dev
set_time_limit(120);

$dotenv = new Dotenv();
$dotenv->bootEnv(dirname(__DIR__) . '/.env');

$env = $_SERVER['APP_ENV'] ?? $_ENV['APP_ENV'] ?? 'dev';
$debug = (bool)($_SERVER['APP_DEBUG'] ?? $_ENV['APP_DEBUG'] ?? ($env === 'dev'));

if ($debug) {
    Debug::enable();
}

$kernel = new Kernel($env, $debug);
$request = Request::createFromGlobals();
$response = $kernel->handle($request);
$response->send();
$kernel->terminate($request, $response);

