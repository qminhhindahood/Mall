import {site} from './site';
import {createReviewedRoutingNetwork} from './routing/reviewed-network';
import type {RoutingNetwork} from './routing/contracts';

// Construct against source-bearing geometry before React serialization. A changed
// source leaves the ordinary map/directory usable, but never falls back to old paths.
export const atlasRouting:RoutingNetwork|null=(()=>{
 try{return createReviewedRoutingNetwork(site)}
 catch(error){console.warn('Atlas guidance unavailable: reviewed source validation failed.',error);return null}
})();
