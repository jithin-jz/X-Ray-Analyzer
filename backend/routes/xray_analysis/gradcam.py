"""
Grad-CAM visualization generator.
- Takes model + preprocessed input
- Generates heatmap overlay on the original image
- Saves to storage and returns path

TODO: Implement when model architecture is finalized.
"""


async def generate_gradcam(image_path: str, model: any, preprocessed_input: any) -> str:
    """
    Generate a Grad-CAM heatmap for the given input.
    Returns the path to the saved heatmap image.
    """
    # Placeholder — implement with pytorch-grad-cam
    raise NotImplementedError("Grad-CAM generation not yet implemented")
