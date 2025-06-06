# 🎬 Instagram Saved Reels Search

A web application that allows you to search through your saved Instagram reels and videos. Built with Streamlit and Instagrapi.

⚠️ **Important Note**: Due to Instagram's privacy restrictions, saved posts are not accessible through unofficial APIs. This app provides alternative methods to work with your saved content.

## ✨ Features

- **Multiple Import Methods**: Upload Instagram data export or use demo data
- **Smart Search**: Search through captions and usernames
- **Beautiful UI**: Modern, Instagram-inspired interface
- **Statistics**: View insights about your saved content
- **Direct Links**: Quick access to view posts on Instagram
- **Demo Mode**: See how the app works with sample data

## 🚀 Quick Start

### Prerequisites

- Python 3.7 or higher
- Instagram account (for data export)
- Stable internet connection

### Installation

1. **Clone or download this project**
   ```bash
   cd instegrmserche
   ```

2. **Install dependencies**
   ```bash
   py -m pip install -r requirements.txt
   ```

3. **Test the installation**
   ```bash
   py test_instagrapi.py
   ```

4. **Run the demo application** (Recommended first step)
   ```bash
   py -m streamlit run app_demo.py
   ```

5. **Run the main application**
   ```bash
   py -m streamlit run app.py
   ```

6. **Open your browser**
   - The app will automatically open at `http://localhost:8501`
   - If it doesn't open automatically, navigate to the URL manually

## 📱 How to Use

### Method 1: Instagram Data Export (Recommended)

1. **Request Your Data from Instagram**:
   - Go to Instagram Settings > Privacy and Security
   - Click "Request Download"
   - Choose JSON format
   - Wait for email (can take up to 48 hours)

2. **Upload to the App**:
   - Login to the app with any Instagram credentials
   - Upload the `saved_media.json` file from your data export
   - The app will process and display your saved content

3. **Search and Browse**:
   - Use the search box to find specific content
   - Search works on captions and usernames
   - Click "View Post" to open the original Instagram post

### Method 2: Demo Mode

1. **Run the Demo**:
   ```bash
   py -m streamlit run app_demo.py
   ```

2. **Explore Features**:
   - See how the app works with sample data
   - Test the search functionality
   - Understand the interface before using real data

### Method 3: Browser Extensions

1. Use browser extensions like "Instagram Downloader"
2. Export your saved posts as JSON/CSV
3. Convert the format to match the app's expected structure

## ⚠️ Important Limitations

### Instagram API Restrictions
- **Saved posts are not accessible** through Instagram's unofficial APIs
- This is a security restriction by Instagram to protect user privacy
- Both `instagrapi` and `instaloader` have this same limitation

### What Works vs. What Doesn't
✅ **Works**:
- Instagram data export processing
- Demo with sample data
- Search and filtering functionality
- Beautiful UI and statistics

❌ **Doesn't Work**:
- Direct API access to saved posts
- Real-time syncing with Instagram
- Automatic updates when you save new posts

## 🛠️ Technical Details

### Built With
- **Streamlit**: Web application framework
- **Instagrapi**: Instagram API library (for login demonstration)
- **Python**: Backend logic

### File Structure
```
instegrmserche/
├── app.py                 # Main application
├── app_alternative.py     # Alternative version with manual session
├── app_demo.py           # Demo version with sample data
├── test_instagrapi.py    # Test script for instagrapi
├── instagram_api_guide.md # Guide for official Instagram API
├── requirements.txt      # Python dependencies
├── README.md            # This file
└── sessions/            # Session files (created automatically)
```

### Data Format
The app expects Instagram data export in this format:
```json
{
  "saved_media": [
    {
      "uri": "https://www.instagram.com/p/ABC123/",
      "title": "Post caption",
      "creation_timestamp": 1234567890,
      "string_map_data": {
        "Username": {"value": "username"}
      }
    }
  ]
}
```

## 🔧 Troubleshooting

### Common Issues

**"No saved posts collection found"**
- This is expected - Instagram doesn't allow API access to saved posts
- Use the Instagram data export method instead
- Try the demo version to see how the app works

**File Upload Issues**
- Make sure you're uploading the correct `saved_media.json` file
- Check that the file is from Instagram's official data export
- Verify the JSON format is valid

**App Won't Start**
- Check that all dependencies are installed: `py -m pip install -r requirements.txt`
- Try the demo version first: `py -m streamlit run app_demo.py`
- Verify Python version is 3.7 or higher

### Getting Help
If you encounter issues:
1. Try the demo version first to ensure the app works
2. Check that your Instagram data export is in the correct format
3. Verify all dependencies are installed correctly
4. Check your internet connection for the Streamlit app

## 📝 Alternative Solutions

Since direct API access isn't possible, consider these alternatives:

1. **Instagram Basic Display API**: Set up official API access (complex but reliable)
2. **Browser Extensions**: Use third-party tools to export saved posts
3. **Manual Tracking**: Keep a personal list of saved post URLs
4. **Screenshots**: Save images locally and organize them manually

## 🤝 Contributing

Feel free to submit issues, feature requests, or improvements! Particularly welcome:
- Better Instagram data export parsing
- Support for additional export formats
- UI/UX improvements
- Alternative data import methods

## 📝 License

This project is for educational and personal use only. Please respect Instagram's Terms of Service and use responsibly.

---

**Disclaimer**: This tool is not affiliated with Instagram. The app demonstrates how to work with Instagram data exports and provides a user interface for searching saved content. Use at your own risk and in compliance with Instagram's Terms of Service. #   s e a r c h R e e l s  
 