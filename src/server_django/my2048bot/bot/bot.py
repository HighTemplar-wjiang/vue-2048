# bot.py
# Created by Weiwei Jiang on 20190307
# My 2048 bot.

import numpy as np


def suggest_next_step(method, checkboard, game_size):

    # Resize the checkboard.
    checkboard = np.reshape(checkboard, game_size)

    # Make suggestion.
    suggestion = methods_mapping[method](checkboard)

    # Make random suggestion.
    return suggestion


def random_method(checkboard):
    # Make random suggestion.
    randints = np.random.randint(10, size=[4])
    move_possibilities = randints / randints.sum()

    return {key: value for (key, value) in zip(["up", "down", "left", "right"], move_possibilities)}


def minimax_method(checkboard):
    return None


methods_mapping = {
    "random": random_method,
    "minimax": minimax_method,
}
available_bot_methods = list(methods_mapping.keys())
