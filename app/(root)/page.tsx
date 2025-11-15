import { auth } from "@/auth";

const Home = async () => {
  const session = await auth();

  return (
    <div>
      <h1 className="h1-bold">Welcome to the world of Next.js</h1>
    </div>
  );
};

export default Home;
