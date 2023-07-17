## Overview

Next Session Provider is a open source session provider solution for [Next.js](http://nextjs.org/) applications.

It is designed based on [NextAuth](https://next-auth.js.org/) package that provides authentication solution. This package is targeted to project that want to have their own authentication or they accually have one.

For now there is a Client Side session provider that store and manage session.

## Getting Started

```
npm install next-session-manager-provider
```

### How to use

1. Configure Shared session state - to be able to use useSession first you'll need to expose the session context <SessionProvider />, at the top level of your application same as in the next-auth package. There is a 1 difference that you have to pass a function named "sessionGetter" that is a API call for your backend server that gets current user based on your authentication.

```javascript
function sessionGetter() {
    fetch("/api/getUser").then((user: User) => {
        // Get user and return it.
        return user;
    })
}

const App = ({ Component, pageProps: { session, ...pageProps } }: AppProps) => {
    return (
        <SessionProvider session={session} sessionGetter={sessionGetter}>
            <Childrens>
        </SessionProvider>
    )
}
```

2. Frotend - React Hooks - The useSession React Hook in the next-session-manager-provider client is the way to get session and status of session

```javascript
import { useSession } from "next-session-manager-provider/react";

const Menu = () => {
    const { data: session, update, status } = useSession();

    // session variable has all information about saved session. example:
    console.log(session.firstName);

    // update is a function that call provider to update state.
    update();

    // status is a type that store session status. There is a 3 session states: "authenticated" | "unauthenticated" | "loading"
    console.log(status); // Its conna output current session status.
}
```

3. Authorization - After authenticate you can trigger function that make session refresh. Example:

```javascript
import { onSignIn, onSingOut } from "next-session-manager-provider/react";

const LoginView = () => {
    const authenticationHandler = () => {
        // Your Authenticate Logic

        // It should refresh your session to the newest using your function that you pass in provider.
        onSignIn();
    }
}

const LogoutView = () => {
    const logoutHandler = () => {
        // Your Logout Logic

        // It should refresh session as function above.
        onSingOut();
    }
}
```

### Typescript support

By default, Typescript will merge new interface properties and overwrite exisiting one. In this case, the default session user properties will be overwitten, with the one one define above.

Example that overwrite whole interface.

```javascript
import NextSessionManagerProvider from "next-session-manager-provider";

export interface UserSession {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
}

declare module "next-session-manager-provider" {
    interface Session {
        user: UserSession;
    }
}
```


### Feature plans

Add getting session on the server side. Right now if you're using cookies as a jwt token storage you just have to get it from request for example with

```javascript
export const axiosInstanceSSR = (cookies: string) =>
    axios.create({
        baseURL: "http://localhost:8080",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Cookie: cookies,
        },
        withCredentials: true,
    });


export const getServerSideProps = async ({ req }: any) => {
    // Send request with axios
    const products = await axiosInstanceSSR(req.headers.cookie).get(`/api/products`);

    return {
        props: {
            data: {
                products,
            }
        },
    }
}
```

## License

ISC