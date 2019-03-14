# Created by Weiwei Jiang on 20190314
#
# Kernel methods for 2048.
#

import numpy as np


class My2048:
    """
    My 2048 class.
    """

    def __init__(self, game_size):
        """
        :param game_size: 2D tuple for the game size.
        """
        self.game_size = tuple(game_size)
        self.checkerboard = np.zeros(self.game_size, dtype=np.int32)
        # Spawn two blocks.
        for _ in range(2):
            self._spawn_new()

    def __str__(self):
        return str(self.checkerboard)

    def _spawn_new(self):
        """Spawn a new block.
        :return: True if success.
        """
        # Get all indexes with 0 value.
        zero_indexes = list(zip(*np.where(self.checkerboard == 0)))
        if not len(zero_indexes):
            return False

        # Randomly pick up an index for spawning.
        target_index = np.random.randint(0, len(zero_indexes))

        # Spawn.
        self.checkerboard[zero_indexes[target_index]] = 2 if np.random.random() < 0.75 else 4

        return True

    def _move_left(self):
        """Take a left move action. All other actions are based on this method.
        :return: True if moved.
        """

        is_moved = False

        for x in range(self.game_size[0]):
            has_merged_list = np.zeros(self.game_size[1], dtype=np.bool)
            for y in range(self.game_size[1]):
                # Skip 0 cells.
                if not self.checkerboard[x, y]:
                    continue

                # Scan to the most left.
                for j in range(y, 0, -1):
                    if not self.checkerboard[x][j-1]:
                        is_moved = True
                        self.checkerboard[x][j-1] = self.checkerboard[x][j]
                        self.checkerboard[x][j] = 0
                    elif (self.checkerboard[x][j-1] == self.checkerboard[x][j]) and not has_merged_list[j-1]:
                        # Merge if possible.
                        has_merged_list[j-1] = True
                        self.checkerboard[x][j-1] *= 2
                        self.checkerboard[x][j] = 0

        return is_moved

    def move(self, direction):
        """
        Take a move.
        :param direction: "up", "down", "left", "right".
        :return: None.
        """

        # Rotate the checkerboard.
        rotation_mapping = {
            "left": 0,
            "up": 1,
            "right": 2,
            "down": 3,
        }
        self.checkerboard = np.rot90(self.checkerboard, k=rotation_mapping[direction], axes=(1, 0))

        # Take move.
        self._move_left()

        # Rotate back.
        self.checkerboard = np.rot90(self.checkerboard, k=4-rotation_mapping[direction], axes=(1, 0))

