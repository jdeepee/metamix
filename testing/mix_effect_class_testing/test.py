from meta_modulate import MetaModulate
import unittest
import librosa

class TestMetaModulate(unittest.TestCase):
    def setUp(self):
        """Create data necassary for testing"""
        source = "/Users/Josh/Music/sample_analysis_songs/A.M.C & Turno - Draw 4 That.mp3"
        data, sr = librosa.load(source, sr=None)
        self.song_object = {}
        self.song_object["song_start"] = 0
        self.song_object["song_end"] = 60
        self.song_object["data"] = data[0*sr: 60*sr]
        self.song_object["sample_rate"] = sr
        self.debug_level = 2

        self.song_object["effects"] = [
            {
                "id": 1,
                "start": 10,
                "end": 50,
                "type": "eq",
                "params": {
                    "strength_curve": "continuous",
                    "frequency": 200,
                    "target_decibel": -20
                }
            },
            {
                "id": 2,
                "start": 10,
                "end": 20,
                "type": "eq",
                "params": {
                    "strength_curve": "linear",
                    "frequency": 200,
                    "start": 1.2,
                    "target": 1.4
                }
            },
            {
                "id": 3,
                "start": 15,
                "end": 25,
                "type": "volume",
                "params": {
                    "strength_curve": "continuous",
                    "start": 1,
                    "target": 2
                }
            },
            {
                "id": 4,
                "start": 30,
                "end": 43.5,
                "type": "volume",
                "params": {
                    "strength_curve": "linear",
                    "start": 1,
                    "target": 0.6
                }
            },
        ]

    def test_modulation(self):
        effect_modulator = MetaModulate(self.song_object, self.debug_level)
        data = effect_modulator.modulate()

        librosa.output.write_wav("./test_out.wav", data, self.song_object["sample_rate"])

if __name__ == '__main__':
    unittest.main()