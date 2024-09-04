from flask import Flask, request, jsonify
import torch
import torch.nn as nn
from transformers import BertModel, BertTokenizer,BertConfig
import os
## Proposed Work ##

class ContentBasedAttention(nn.Module):
    def __init__(self, hidden_size, num_heads=4):
        super(ContentBasedAttention, self).__init__()
        self.hidden_size = hidden_size
        self.num_heads = num_heads
        self.head_dim = hidden_size // num_heads

        self.query = nn.Linear(hidden_size, hidden_size)
        self.key = nn.Linear(hidden_size, hidden_size)
        self.value = nn.Linear(hidden_size, hidden_size)

    def forward(self, x):
        batch_size, seq_length, _ = x.size()

        # Linear transformations for query, key, and value
        queries = self.query(x).view(batch_size, seq_length, self.num_heads, self.head_dim)
        keys = self.key(x).view(batch_size, seq_length, self.num_heads, self.head_dim)
        values = self.value(x).view(batch_size, seq_length, self.num_heads, self.head_dim)

        # Calculate attention scores
        energy = torch.einsum("ijkl,ijml->ijkm", queries, keys) / (self.head_dim ** 0.5)
        attention = torch.nn.functional.softmax(energy, dim=-1)

        # Apply attention to values
        out = torch.einsum("ijkl,ijlm->ijkm", attention, values).view(batch_size, seq_length, -1)
        return out

class BertWithContentBasedAttention(nn.Module):
    def __init__(self, config, num_classes):
        super().__init__()
        self.bert = BertModel(config)  # Initialize BERT model with custom config
        self.attention = ContentBasedAttention(config.hidden_size, config.num_attention_heads)
        self.dropout1 = nn.Dropout(0.1)
        self.dense1 = nn.Linear(config.hidden_size, config.hidden_size)
        self.norm = nn.LayerNorm(config.hidden_size, eps=1e-6)
        self.dropout2 = nn.Dropout(0.1)
        self.classifier = nn.Linear(config.hidden_size, num_classes)

    def forward(self, input_ids, attention_mask):
        outputs = self.bert(input_ids, attention_mask=attention_mask)
        hidden_states = outputs.last_hidden_state
        # Apply content-based attention mechanism
        attention_output = self.attention(hidden_states)
        pooled_output = torch.mean(attention_output, dim=1)
        pooled_output = self.dropout1(pooled_output)
        pooled_output = self.dense1(pooled_output)
        pooled_output = self.norm(pooled_output)
        pooled_output = self.dropout2(pooled_output)
        logits = self.classifier(pooled_output)
        return logits,hidden_states


def build_model(vocab_size, type_vocab, max_position_embedding, model_name,
                num_classes=2, learning_rate=2e-6, eps=1e-8):
    # Check if CUDA is available, and set the device accordingly
    device = torch.device('cpu')

    # Load the pre-trained BERT model and tokenizer
    tokenizer = BertTokenizer.from_pretrained(str(model_name))
    
    # Load the BERT configuration
    bert_config = BertConfig.from_pretrained(str(model_name))
    
    # Manually modify the BERT configuration
    bert_config.vocab_size = vocab_size  # Set based on your vocabulary size
    bert_config.type_vocab_size = type_vocab
    bert_config.max_position_embeddings = max_position_embedding

    # Initialize the custom BERT model with modified config
    model = BertWithContentBasedAttention(bert_config, num_classes)
    
    # Move the model to the selected device
    model = model.to(device)

    # Set up the optimizer and loss function
    optimizer = torch.optim.AdamW(model.parameters(), lr=learning_rate, eps=eps)

    return model, optimizer, device, num_classes

def load_model(model_checkpoint):
    checkpoint = torch.load(model_checkpoint, map_location=torch.device('cpu'))
    model,optimizer,device,num_classes = build_model(vocab_size=42903, type_vocab=1, max_position_embedding=140, model_name='bert-base-uncased',
                num_classes=2)
    model.load_state_dict(checkpoint['model'])
    optimizer = torch.optim.AdamW(model.parameters(), lr=2e-5)
    optimizer.load_state_dict(checkpoint['optimizer'])
    
    # Ensure the model is in evaluation mode
    model.eval()
    
    return model, optimizer, device


model_checkpoint = os.path.join(os.getcwd(),'bert_weights_epoch_1_92.187.pt')
model, optimizer,device = load_model(model_checkpoint)
quantized_model = torch.quantization.quantize_dynamic(
    model,
    {torch.nn.Linear},
    dtype=torch.qint8  # Use int8 for quantization
)
tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')

# Function to classify tweet
def classify_tweet_proposed(tweet, device):
    quantized_model.eval()
    # Tokenize the input tweet
    inputs = tokenizer(tweet, return_tensors="pt", truncation=True, padding=True,max_length=140)
    input_ids = inputs['input_ids'].to(device)
    attentions = inputs['attention_mask'].to(device)
    
    # Forward pass through the model
    with torch.no_grad():
        logits, _ = quantized_model(input_ids, attentions)
    
    # Apply sigmoid to get probabilities
    probabilities = torch.sigmoid(logits)
    
    return probabilities.tolist()