"""
X-Ray image preprocessing pipeline.
- Load image from path (local or S3)
- Resize, normalize, convert to tensor
- Return model-ready input

TODO: Implement when model architecture is finalized.
"""


async def preprocess_image(image_path: str) -> any:
    """
    Load and preprocess an X-ray image for inference.
    Returns a model-ready tensor/array.
    """
    # Placeholder — implement with PIL/torchvision
    raise NotImplementedError("Image preprocessing not yet implemented")
