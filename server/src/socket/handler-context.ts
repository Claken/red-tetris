import { WaitGame } from '../../class/waitGame/waitGame';
import { ManageSocket } from '../../class/manageSocket/manageSocket';

export interface HandlerContext {
  waitGame: WaitGame;
  manageSocket: ManageSocket;
  isValidData: (data: any, ...fields: string[]) => boolean;
}
