#!/bin/bash

# ===================================================================
# Sound Conversion Pipeline
# 
# Converts audio files with intelligent processing:
# - Format conversion (ogg → mp3/wav)
# - Silence detection and trimming
# - Volume normalization
# - Batch pitch variations
# ===================================================================

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RESET='\033[0m'

# Paths
SOURCE_DIR="$HOME/Downloads/Interface Sounds/Audio"
OUTPUT_BASE="static/sounds/kenney"
MANIFEST_FILE="$OUTPUT_BASE/manifest.json"

# Create output directories
mkdir -p "$OUTPUT_BASE/original"
mkdir -p "$OUTPUT_BASE/variations"
mkdir -p "$OUTPUT_BASE/processed"

echo -e "${CYAN}═══════════════════════════════════════════════════════${RESET}"
echo -e "${YELLOW}🎵 SoftStack Sound Conversion Pipeline${RESET}"
echo -e "${CYAN}═══════════════════════════════════════════════════════${RESET}"

# Function to convert a single file
convert_sound() {
    local input="$1"
    local output="$2"
    local options="$3"
    
    local filename=$(basename "$input" .ogg)
    
    echo -e "${BLUE}Converting: ${filename}${RESET}"
    
    # Basic conversion with optimization
    ffmpeg -i "$input" \
        -af "silenceremove=start_periods=1:start_silence=0.01:start_threshold=-50dB,silenceremove=stop_periods=-1:stop_silence=0.01:stop_threshold=-50dB,loudnorm=I=-16:LRA=11:TP=-1.5" \
        -acodec mp3 \
        -ab 96k \
        -ar 44100 \
        "$output" \
        -loglevel error \
        -y
}

# Function to create pitch variations
create_variations() {
    local input="$1"
    local base_name="$2"
    
    # Create 3 variations: low (-4), normal (0), high (+4)
    for pitch in -4 0 4; do
        local suffix=""
        case $pitch in
            -4) suffix="_low" ;;
            0) suffix="" ;;
            4) suffix="_high" ;;
        esac
        
        local output="$OUTPUT_BASE/variations/${base_name}${suffix}.mp3"
        
        if [ $pitch -eq 0 ]; then
            # Just copy the original
            cp "$input" "$output"
        else
            # Apply pitch shift
            local rate=$(echo "scale=4; 44100 * 2^($pitch/12)" | bc -l)
            ffmpeg -i "$input" \
                -af "asetrate=$rate,aresample=44100" \
                -acodec mp3 \
                -ab 96k \
                "$output" \
                -loglevel error \
                -y
        fi
    done
}

# Count total files
TOTAL=$(find "$SOURCE_DIR" -name "*.ogg" | wc -l)
CURRENT=0

echo -e "${GREEN}Found $TOTAL .ogg files to convert${RESET}"
echo

# Convert all files
for ogg_file in "$SOURCE_DIR"/*.ogg; do
    CURRENT=$((CURRENT + 1))
    
    filename=$(basename "$ogg_file" .ogg)
    category=$(echo "$filename" | sed 's/_[0-9]*//')
    
    # Progress indicator
    echo -e "${CYAN}[$CURRENT/$TOTAL]${RESET} Processing: $filename"
    
    # Convert to MP3
    mp3_output="$OUTPUT_BASE/original/${filename}.mp3"
    convert_sound "$ogg_file" "$mp3_output"
    
    # Create variations for select sounds (first of each category)
    if [[ "$filename" == *"_001" ]]; then
        echo -e "  ${YELLOW}→ Creating pitch variations${RESET}"
        create_variations "$mp3_output" "$filename"
    fi
done

echo
echo -e "${GREEN}✅ Conversion complete!${RESET}"

# ===================================================================
# Generate Manifest
# ===================================================================

echo -e "${YELLOW}📝 Generating manifest.json...${RESET}"

cat > "$MANIFEST_FILE" << 'EOF'
{
  "name": "kenney",
  "version": "1.0.0",
  "author": "Kenney.nl",
  "license": "CC0",
  "description": "High-quality interface sounds",
  "formats": {
    "preferred": ["mp3", "ogg", "wav"],
    "fallback": "synth"
  },
  "sounds": {
EOF

# Group sounds by category
declare -A categories
for file in "$OUTPUT_BASE/original"/*.mp3; do
    filename=$(basename "$file" .mp3)
    category=$(echo "$filename" | sed 's/_[0-9]*//')
    number=$(echo "$filename" | sed 's/.*_//')
    
    if [ -z "${categories[$category]}" ]; then
        categories[$category]="$number"
    else
        categories[$category]="${categories[$category]} $number"
    fi
done

# Write categories to manifest
first_category=true
for category in "${!categories[@]}"; do
    if [ "$first_category" = false ]; then
        echo "," >> "$MANIFEST_FILE"
    fi
    first_category=false
    
    echo -n "    \"$category\": {" >> "$MANIFEST_FILE"
    
    # Add primary and variants
    echo "" >> "$MANIFEST_FILE"
    echo "      \"primary\": \"original/${category}_001.mp3\"," >> "$MANIFEST_FILE"
    echo "      \"secondary\": \"original/${category}_002.mp3\"," >> "$MANIFEST_FILE"
    echo -n "      \"variants\": [" >> "$MANIFEST_FILE"
    
    # List all variants for this category
    first_variant=true
    for num in ${categories[$category]}; do
        if [ "$first_variant" = false ]; then
            echo -n ", " >> "$MANIFEST_FILE"
        fi
        first_variant=false
        echo -n "\"original/${category}_${num}.mp3\"" >> "$MANIFEST_FILE"
    done
    
    echo "]" >> "$MANIFEST_FILE"
    echo -n "    }" >> "$MANIFEST_FILE"
done

cat >> "$MANIFEST_FILE" << 'EOF'

  },
  "gradients": {
    "click": {
      "baseSound": "original/click_001.mp3",
      "type": "pitch",
      "range": 8,
      "scale": "pentatonic"
    },
    "hover": {
      "baseSound": "original/scroll_001.mp3",
      "type": "pitch",
      "range": 4,
      "scale": "major"
    }
  },
  "haptics": {
    "click": "light",
    "confirmation": "medium",
    "error": "heavy"
  }
}
EOF

echo -e "${GREEN}✅ Manifest generated!${RESET}"

# ===================================================================
# Summary
# ===================================================================

echo
echo -e "${CYAN}═══════════════════════════════════════════════════════${RESET}"
echo -e "${GREEN}📊 Conversion Summary:${RESET}"
echo -e "  • Converted: $TOTAL files"
echo -e "  • Output: $OUTPUT_BASE"
echo -e "  • Categories: ${#categories[@]}"
echo -e "  • Formats: MP3 (optimized for web)"
echo -e "  • Processing: Silence trimmed, normalized"
echo -e "${CYAN}═══════════════════════════════════════════════════════${RESET}"
echo
echo -e "${YELLOW}🚀 Next steps:${RESET}"
echo -e "  1. Test sounds: deno task start"
echo -e "  2. View manifest: cat $MANIFEST_FILE | jq"
echo -e "  3. Use in code: import { SoundPack } from './utils/audio/SoundPack.ts'"