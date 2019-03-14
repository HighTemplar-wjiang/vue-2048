import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim
from .my2048kernel import My2048


class TorchNN(nn.Module):
    """Pytorch neural network for training."""

    def __init__(self, game_size):
        """Define the neural network.
        :param game_size: 2D tuple of the checkerboard's size.
        """
        super(self.__class__, self).__init__()

        # Parameters.
        self.game_size = game_size
        self.input_size = np.prod(self.game_size)

        # Layers.
        self.fc_layers = nn.Sequential()
        self.hidden_layer_dimensions = [self.input_size, self.input_size, self.input_size]

        # Adding layers.
        last_dimension = self.input_size
        for idx_layer, layer_dimension in enumerate(self.hidden_layer_dimensions):
            self.fc_layers.add_module(
                "FC_" + str(idx_layer),
                nn.Linear(last_dimension, layer_dimension)
            )
            self.fc_layers.add_module(
                "NormBatch_" + str(idx_layer),
                nn.BatchNorm1d(layer_dimension)
            )
            self.fc_layers.add_module(
                "Activation_" + str(idx_layer),
                F.relu()
            )

    @staticmethod
    def _norm_input(x):
        """
        Normalize inputs.
        :param x: Inputs.
        :return: Normalized inputs.
        """

        x = np.log2(x)
        x[x < 1] = 0
        return x

    def forward(self, x):
        """
        Forwarding.

        :param x: Inputs.
        :return: Outputs of the networking.
        """
        x = self._norm_input(x)
        x = self.fc_layers(x)

        return x


class My2048Bot:
    """My 2048 bot."""

    def __init__(self, game_size):
        self.my2048 = My2048(game_size)
        self.model = None

    def _eval_score(self):
        """Evaluate current checkerboard and give a score."""
        pass

    def predict(self):
        """Predict next step."""
        pass

    def train(self):
        """Train the model."""
        pass

    def save_model(self):
        """Save current model."""
        pass

    def load_model(self):
        """Load a saved model."""
        pass





