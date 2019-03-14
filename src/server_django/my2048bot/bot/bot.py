# bot.py
# Created by Weiwei Jiang on 20190307
# My 2048 bot.

import numpy as np


def suggest_next_step(method, checkerboard, game_size):
    """
    Master method for suggesting next step.

    :param method: Required method.
    :param checkerboard: Current checkerboard status in 1D.
    :param game_size: 2D tuple of game size.
    :return: Suggestion dictionary.
    """
    # Resize the checkerboard.
    checkerboard = np.reshape(checkerboard, game_size)

    # Make suggestion.
    suggestion = methods_mapping[method](checkerboard)

    # Make random suggestion.
    return suggestion


def random_method(checkerboard):
    """Make a random suggestion."""
    # Make random suggestion.
    randints = np.random.randint(10, size=[4])
    move_possibilities = randints / randints.sum()

    return {key: value for (key, value) in zip(["up", "down", "left", "right"], move_possibilities)}


def minimax_method(checkerboard):
    return None


methods_mapping = {
    "random": random_method,
    "minimax": minimax_method,
}
available_bot_methods = list(methods_mapping.keys())
