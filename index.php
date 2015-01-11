<?php
include 'vendor/autoload.php';

$env = new Twig_Environment(new Twig_Loader_Filesystem(array(__DIR__.'/templates/')));
$env->display('base.twig');