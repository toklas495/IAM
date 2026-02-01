# Sequence diagrams
> A Sequence diagram is an interaction diagram that shows how processes operate with one another and in what order.

```mermaid
    sequenceDiagram
        Alice->>John: Hello how are you?
        John-->>Alice: Great!
        Alice-)John: See you
```

```mermaid
    sequenceDiagram
        participant Alice
        participant BoB
        BoB->>Alice: Hi Alice
        Alice->>BoB: Hi Bob
```

```mermaid
    sequenceDiagram
        
        Actor User
        participant Client
        participant Server@{type: "database"}
        participant Oauth
        User->>Client: Hey i want login with google?
        Client->>Server: User want login with google?
        Server->>Client: Redirect user to google endpoint!
        Client->>Oauth: Redirect to user and ask could i can access user info?
        Oauth->>User:hey user client need your info(scope) granted or not?
        User->>Oauth: ya granted!
        Oauth->>Client: Redirect back with stateToken and responseType(code)!
        Client->>Server: send this to server for processing!
        Server->>Oauth: send authorization_code with all cred!
        Oauth->>Server: give access_token or id_token!
        Server->>Oauth: server can access all informatin!
        Server->>User: you are loggedIn and you can access server!
```


