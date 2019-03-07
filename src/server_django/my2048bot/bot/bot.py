# bot.py
# Created by Weiwei Jiang on 20190307
# My 2048 bot.

import numpy as np


def suggest_next_step(checkboard, game_size):
    # Resize the checkboard.
    checkboard = np.reshape(checkboard, game_size)

    # Make random suggestion.
    randints = np.random.randint(10, size=[4])
    move_possibilities = randints / randints.sum()

    return {key: value for (key, value) in zip(["up", "down", "left", "right"], move_possibilities)}
