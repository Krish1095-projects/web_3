import torch
import torch.nn as nn
from transformers import BertModel, BertTokenizer
import os
from proposed_work import *



# Quantize your model
quantized_model = torch.quantization.quantize_dynamic(
    model,
    {torch.nn.Linear},
    dtype=torch.qint8  # Use int8 for quantization
)

# Load your tokenizer
tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')

# Save both the quantized model and tokenizer in a single file
torch.save({
    'model_state_dict': quantized_model.state_dict(),
    'optimizer_state_dict': optimizer.state_dict(),
    'tokenizer': tokenizer
}, os.path.join(os.getcwd(),'quantized_models','QMT_P.pt'))