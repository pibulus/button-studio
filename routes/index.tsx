import { Head } from "$fresh/runtime.ts";
import ButtonStudio from "../islands/ButtonStudio.tsx";

export default function Home() {
  return (
    <>
      <Head>
        <title>Voice Button Studio</title>
        <meta name="description" content="Design your perfect voice button" />
        <link rel="icon" type="image/svg+xml" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800;900&display=swap" rel="stylesheet" />
      </Head>
      
      <ButtonStudio />
    </>
  );
}
