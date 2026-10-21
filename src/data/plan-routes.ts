// Public-aisle schematic from original L2/L3 plans. Zone A pairing is plan-based,
// not operational verification, surveyed alignment, accessibility or exact doors.
const ck='saigon-prototype-calvinklein',mlb='saigon-prototype-mlb';
export const planConnection={id:'saigon-zone-a-l2-l3',mall:'saigon-centre',floors:['L2','L3']};
const legs=[{floor:'L2',hash:'4749dd738ea148407c334396183ef917711f4ff10fbfaa796a7ff6f31ede4fd5',points:[[2813,1220],[2954,1530],[3076,1851],[3205,2192],[3235,2348],[3027,2431],[2518,2578],[2457,2510]]},{floor:'L3',hash:'905e5de4c90debbabddd8a7fadf9e47b5084bf6b01703ba5450b9e8603763ab8',points:[[2619,2573],[2688,2610],[3008,2526]]}];
export function planRoute(mall:string,from?:string,to?:string){
 if(mall!==planConnection.mall||!((from===ck&&to===mlb)||(from===mlb&&to===ck)))return null;
 const reverse=from===mlb;
 return {connection:planConnection,legs:reverse?legs.slice().reverse().map(l=>({...l,points:l.points.slice().reverse()})):legs,steps:reverse?[
  {floor:'L3',text:'From the public aisle in front of MLB, follow the marked aisle toward the central atrium and Zone A lifts. Stay outside the emergency/service rectangle.'},
  {floor:'L3',transferTo:'L2',text:'At Zone A, check that the lift serves L2. Take it to L2; if unavailable, ask mall staff. This transfer is paired from the named areas on the plans.'},
  {floor:'L2',text:'After reaching L2, use the public concourse beside Zone A. Follow the marked bend past Weekend by Max Mara and around LYN.'},
  {floor:'L2',text:'Continue along the outer shopping aisle past ALDO, Pedro and Armani Exchange toward CALVIN KLEIN.'},
  {floor:'L2',text:'Stop at the CALVIN KLEIN area frontage. The map does not identify an exact doorway.'}
 ]:[
  {floor:'L2',text:'Start in the public aisle beside CALVIN KLEIN. Follow the marked outer shopping aisle past Armani Exchange, Pedro and ALDO.'},
  {floor:'L2',text:'Follow the bend around LYN, then continue along the public concourse in front of Weekend by Max Mara toward Zone A.'},
  {floor:'L2',text:'Reach the public landing beside the Zone A lifts. Stay in the concourse outside the marked service areas.'},
  {floor:'L2',transferTo:'L3',text:'Check that the Zone A lift serves L3, then take it to L3. If unavailable, ask mall staff. This transfer is paired from the named areas on the plans.'},
  {floor:'L3',text:'After reaching L3, follow the marked public aisle around the service rectangle beside Zone A, toward MLB.'},
  {floor:'L3',text:'Stop at the MLB area frontage. The map does not identify an exact doorway.'}
 ]};
}
