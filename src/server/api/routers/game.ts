import { z } from 'zod';

import { createTRPCRouter, protectedProcedure, publicProcedure } from '~/server/api/trpc';

const processWord = (word: string) => {
  return { acceptedWord: true, score: word.length };
};

export const gameRouter = createTRPCRouter({
  getGameByDate: publicProcedure
    .input(z.object({ date: z.date() }))
    .query(async ({ input, ctx }) => {
      if (!input.date) {
        throw new Error('No date passed');
      }

      const game = await ctx.prisma.game.findMany({ where: { date: input.date } });

      if (!game[0]) {
        throw new Error('No game found with that date');
      }

      return { ...game[0], letters: game[0].letters.split(' ') };
    }),

  getUserGameByGameId: protectedProcedure
    .input(z.object({ gameId: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      if (!input.gameId) {
        throw new Error('No gameId passed');
      }

      const userGame = await ctx.prisma.userGame.findMany({
        where: { userId: ctx.session.user.id, gameId: input.gameId },
      });

      if (!userGame[0]) {
        throw new Error('No game found with that id');
      }

      return { ...userGame[0], words: userGame[0].words.split('/n') };
    }),

  postWord: protectedProcedure
    .input(z.object({ word: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userGame = await ctx.prisma.userGame.findMany({
        where: {
          userId: ctx.session.user.id,
        },
      });

      if (userGame.length === 0) {
        throw new Error("Can't find no damn game");
      }

      const { score: oldScore, updatedAt, words: oldWords } = userGame[0]!;
      const processedWord = processWord(input.word);

      await ctx.prisma.userGame.update({
        where: { id: userGame[0]?.id },
        data: {
          score: oldScore + processedWord.score,
          words: processedWord.acceptedWord ? oldWords.concat(input.word) : oldWords,
          updatedAt: new Date(),
        },
      });

      const score = userGame.at(0)?.score;
      const words = userGame.at(0)?.words;

      return { status: 'ok', score, words };
    }),
});
