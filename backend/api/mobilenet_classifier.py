# mobilenet_classifier.py
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image as keras_image
import numpy as np

# Load the trained Keras model
model = load_model("models/mobilenetv7_new_data (1).h5")

# Your class labels (ordered as during training)
CLASS_NAMES = ['Atypical lymphocyte', 'Band Neutrophil', 'Basophil', 'Blast', 'Eosinophil', 'Lymphocyte', 'Metamyelocyte', 'Monocyte', 'Myelocyte', 'NRC', 'Promyelocyte', 'Segmented neutrophil']

def classify_roi(image_path):
    img = keras_image.load_img(image_path, target_size=(224, 224))
    img_array = keras_image.img_to_array(img)
    img_array = img_array / 255.0  # normalize to [0, 1]
    img_array = np.expand_dims(img_array, axis=0)  # batch dimension

    predictions = model.predict(img_array)[0]
    pred_index = np.argmax(predictions)
    confidence = round(float(predictions[pred_index]), 3)
    label = CLASS_NAMES[pred_index]

    return label, confidence
