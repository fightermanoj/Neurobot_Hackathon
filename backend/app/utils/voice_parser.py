import re

def parse_voice_command(raw_command: str) -> dict:
    """
    Parse voice commands and extract action, entity, and batch number
    
    Examples:
    - "Starting washing batch five" -> {action: 'starting', entity: 'washing', batch: '5'}
    - "Material received from preprocessing" -> {action: 'received', entity: 'material', station: 'preprocessing'}
    - "Machine stopped at drying" -> {action: 'machine_stopped', station: 'drying'}
    """
    
    command_lower = raw_command.lower().strip()
    
    # Initialize result
    result = {
        "action": None,
        "entity": None,
        "station": None,
        "batch_number": None,
        "quantity": None
    }
    
    # Action keywords
    actions = {
        "starting": ["starting", "start", "begin", "initiated"],
        "completed": ["completed", "complete", "finished", "done"],
        "received": ["received", "received from"],
        "moving": ["moving", "transferring", "sending"],
        "machine_stopped": ["machine stopped", "machine issue", "breakdown"],
        "quality_check": ["quality check", "qc passed", "qc failed"]
    }
    
    for action, keywords in actions.items():
        for keyword in keywords:
            if keyword in command_lower:
                result["action"] = action
                break
    
    # Station keywords
    stations = {
        "STATION_1": ["receiving", "storage"],
        "STATION_2": ["washing", "peeling"],
        "STATION_3": ["blanching"],
        "STATION_4": ["slicing"],
        "STATION_5": ["drying"],
        "STATION_6": ["grinding", "sieving"],
        "STATION_7": ["packaging", "mixing"],
        "STATION_8": ["quality check", "qc", "dispatch"]
    }
    
    for station_id, keywords in stations.items():
        for keyword in keywords:
            if keyword in command_lower:
                result["station"] = station_id
                result["entity"] = keyword
                break
    
    # Extract batch number
    batch_match = re.search(r'batch\s+(\w+)', command_lower)
    if batch_match:
        batch_num = batch_match.group(1)
        # Convert word numbers to digits
        number_words = {
            'one': '1', 'two': '2', 'three': '3', 'four': '4', 'five': '5',
            'six': '6', 'seven': '7', 'eight': '8', 'nine': '9', 'ten': '10'
        }
        result["batch_number"] = number_words.get(batch_num, batch_num)
    
    # Extract quantity
    quantity_match = re.search(r'(\d+)\s*kg', command_lower)
    if quantity_match:
        result["quantity"] = float(quantity_match.group(1))
    
    return result