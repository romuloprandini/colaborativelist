<?php

    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json; charset=UTF-8");

    require_once "lib/couch.php";
    require_once "lib/couchClient.php";
    require_once "lib/couchAdmin.php";
    
//Define here the username and password from CouchDB
    $serverDNS = "localhost:5984";
    $adminName = "admin";
    $adminPassword = "password";
    $databaseUser = "_users";
    
    $admclient = new couchClient ("http://".$adminName.":".$adminPassword."@".$serverDNS, $databaseUser );
    $adm = new couchAdmin($admclient);

    function json_user($user)
    {
        $json = "";
        if($user != null) {
            if(isset($user->id)) {
                return "{\"_id\":\"".$user->id."\", \"name\":\"".$user->key."\", \"fullname\":\"".$user->value->fullname."\", \"email\":\"".$user->value->email."\", \"avatar\":\"".$user->value->avatar."\"}";  
            }            
            return "{\"_id\":\"".$user->_id."\", \"name\":\"".$user->name."\", \"fullname\":\"".$user->metadata->fullname."\", \"email\":\"".$user->metadata->email."\", \"avatar\":\"".$user->metadata->avatar."\"}";
        }
    }

    if(isset($_GET["username"]) && trim($_GET["username"]) != "") {
        try {
            $user = $adm->getUser($_GET["username"]);
            echo "{\"ok\": true, \"user\":".json_user($user)."}";
        } catch(Exception $e) {
            echo "{\"ok\": false, \"error\": \"no record found\"}";
        }        
        return;
    }


    //Get Request
    if(isset($_GET["search"]) && trim($_GET["search"]) != "" && strlen($_GET["search"]) > 3) {
        $search = $_GET["search"];
        $users = $adm->getUsers($search, $search."ZZZZ");
        if($users != null) {
            $response = "{\"ok\": true, \"userlist\": ["; 
            foreach ($users as $key => $user) {
                $response = $response.json_user($user).","; 
            }
            $response = rtrim($response, ",");
            echo  $response."]}";
        } else {
            echo "{\"ok\": false}";
        }
        
        return;
    }

    $postdata = file_get_contents("php://input");
    if (isset($postdata)) {

        $request = json_decode($postdata);
        if ($request == null) {
            echo "{\"ok\": \"error\":\"Invalid data\"}";
            return;
        }

        if($request->username ==null || $request->password == null || trim($request->username) == "" || trim($request->password) == "") {
            echo "{\"ok\": false, \"error\":\"User and password cannot be empty\"}";
            return;
        }
        
        $user = $admin->getUser($request->username);
        if($user != null) {
            echo "{\"ok\": false, \"error\": \"The username already exists.\"}";
            return;
        }

        if($request->fullname == null || trim($request->fullname) == "") {
            echo "{\"ok\": false, \"error\": \"The user's name are required.\"}";
            return;
        }

        if($request->email == null || trim($request->email) == "") {
            echo "{\"ok\": false, \"error\": \"The user's email are required.\"}";
            return;
        }

        $metadata = new stdClass();
        $metadata->fullname = $request->fullname;
        $metadata->email = $request->email;
        $metadata->avatar = "";

        if($request->avatar != null && trim($request->avatar) != "") {
            $metadata->avatar = $request->avatar;
        }

        // create a regular (no superadmin) user)
        try {
            $adm->createUser($request->username,$request->password, $metadata);
            $user = $adm->getUser($request->username);
            echo "{\"ok\": true, \"user\":".json_encode($user)."}";
        } catch ( Exception $e ) {
            echo "{\"ok\": false, \"error\": \"unable to create regular user: ".$e->getMessage()."\"}";
        }
    }
