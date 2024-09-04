import torch
import torch.nn as nn
from transformers import BertModel, BertTokenizer
import os
## Existing Work ##
class BertForBinaryClassClassification(nn.Module):
    def __init__(self, num_classes):
        super(BertForBinaryClassClassification, self).__init__()
        self.bert = BertModel.from_pretrained('bert-base-uncased')
        self.dropout = nn.Dropout(0.1)
        self.classifier = nn.Linear(self.bert.config.hidden_size, num_classes)

    def forward(self, input_ids, attention_mask):
        outputs = self.bert(input_ids=input_ids, attention_mask=attention_mask)
        pooled_output = outputs.pooler_output
        pooled_output = self.dropout(pooled_output)
        logits = self.classifier(pooled_output)
        return logits

def build_model(num_classes=2, learning_rate=2e-5):
    model = BertForBinaryClassClassification(num_classes)
    optimizer = torch.optim.AdamW(model.parameters(), lr=learning_rate)
    device = torch.device("cpu")
    model.to(device)
    return model, optimizer, device, num_classes

def load_model(model_checkpoint, num_classes):
    checkpoint = torch.load(model_checkpoint, map_location=torch.device('cpu'))
    model, optimizer, device, num_classes = build_model(num_classes)
    model.load_state_dict(checkpoint['model_state_dict'])
    optimizer.load_state_dict(checkpoint['optimizer_state_dict'])
    
    model.eval()
    return model, optimizer , device

model_checkpoint = os.path.join(os.getcwd(),'bertbased.pt')
model, optimizer,device = load_model(model_checkpoint, num_classes=2)
quantized_model = torch.quantization.quantize_dynamic(
    model,
    {torch.nn.Linear},
    dtype=torch.qint8  # Use int8 for quantization
)


tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')





## Functions ## 
def classify_tweet(tweet,device):
    inputs = tokenizer(tweet, return_tensors="pt", truncation=True, padding=True)
    input_ids = inputs['input_ids'].to(device)
    attentions = inputs['attention_mask'].to(device)
    with torch.no_grad():
        outputs = quantized_model(input_ids, attentions)
    probabilities = torch.sigmoid(outputs)
    return probabilities.tolist()
