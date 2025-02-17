import type { Route } from '../routes/+types/home';

export function Home({ loaderData }: Route.ComponentProps) {
  console.log(loaderData);
  return (
    <main>
      <div>
        <header>Leather Earn {loaderData.name}</header>
      </div>
    </main>
  );
}
