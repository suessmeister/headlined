import City from "../../../components/City"; // <-- Your City component

export default function CityPage({ params }: { params: { matchId: string } }) {
   const matchId = params.matchId;

   if (!matchId) {
      return <div>Loading...</div>; // Wait for params to load
   }

   return <City matchId={matchId} />;
 
}
