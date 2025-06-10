import Tournament,{ ITournament } from '../Model/tournamentModel'

const tournamentService = async (data: Partial<ITournament>): Promise<ITournament> => {
  const tournament = new Tournament(data);
  return await tournament.save();
};

export default tournamentService;
