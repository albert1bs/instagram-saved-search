from flask import Flask, request, jsonify
from flask_cors import CORS
from instagrapi import Client
import time
import os
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Store Instagram client instances
clients = {}

# Session storage directory
SESSION_DIR = "sessions"
if not os.path.exists(SESSION_DIR):
    os.makedirs(SESSION_DIR)

def save_session(username, client):
    """Save Instagram session to file"""
    try:
        session_file = f"{SESSION_DIR}/{username}.json"
        client.dump_settings(session_file)
        print(f"Session saved for {username}")
    except Exception as e:
        print(f"Error saving session: {e}")

def load_session(username, client):
    """Load Instagram session from file"""
    try:
        session_file = f"{SESSION_DIR}/{username}.json"
        if os.path.exists(session_file):
            client.load_settings(session_file)
            print(f"Session loaded for {username}")
            return True
        return False
    except Exception as e:
        print(f"Error loading session: {e}")
        return False

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'success': True,
        'message': 'השרת פועל תקין',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/login', methods=['POST'])
def login():
    """Login to Instagram"""
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({
            'success': False,
            'message': 'אנא הזן גם שם משתמש וגם סיסמה'
        })

    try:
        # Create instagrapi client
        client = Client()
        
        # Try to load existing session first
        session_loaded = load_session(username, client)
        
        if session_loaded:
            try:
                client.login(username, password)
                # Test if session is still valid
                client.account_info()
                clients[username] = client
                
                return jsonify({
                    'success': True,
                    'message': 'התחברת בהצלחה באמצעות session שמור'
                })
            except Exception as session_error:
                print(f"Saved session invalid: {session_error}")
        
        # Fresh login
        try:
            # Add delay to avoid rate limiting
            time.sleep(2)
            
            client.login(username, password)
            
            # Save session for future use
            save_session(username, client)
            
            # Store client instance
            clients[username] = client
            
            return jsonify({
                'success': True,
                'message': 'התחברת בהצלחה לאינסטגרם!'
            })
            
        except Exception as login_error:
            error_msg = str(login_error).lower()
            
            # Handle specific error types
            if "bad credentials" in error_msg or "invalid credentials" in error_msg:
                message = "שם משתמש או סיסמה שגויים"
            elif "two factor" in error_msg or "2fa" in error_msg:
                message = "אימות דו-שלבי מופעל. אנא השבת זמנית"
            elif "challenge" in error_msg or "checkpoint" in error_msg:
                message = "נדרש אימות נוסף באינסטגרם. אנא התחבר באתר תחילה"
            elif "rate limit" in error_msg or "too many" in error_msg:
                message = "יותר מדי ניסיונות התחברות. נסה שוב בעוד כמה דקות"
            else:
                message = f"ההתחברות נכשלה: {str(login_error)}"
            
            return jsonify({
                'success': False,
                'message': message
            })
                
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'שגיאה בלתי צפויה: {str(e)}'
        })

@app.route('/api/saved-posts', methods=['GET'])
def get_saved_posts():
    """Get saved posts from Instagram"""
    try:
        # Get username from query params or use the first logged in user
        username = request.args.get('username')
        
        if not username and clients:
            username = list(clients.keys())[0]
        
        if not username or username not in clients:
            return jsonify({
                'success': False,
                'message': 'לא מחובר. אנא התחבר תחילה'
            })
        
        client = clients[username]
        
        try:
            # Try to get saved collections (this is the working method from your Python app)
            collections = client.collections()
            saved_posts = []
            
            for collection in collections[:10]:  # Increased to 10 collections
                try:
                    # Get more posts from each collection
                    collection_posts = client.collection_medias(collection.id, amount=200)  # Increased to 200 per collection
                    
                    for media in collection_posts:
                        post_data = {
                            'shortcode': media.code,
                            'caption': media.caption_text if media.caption_text else "ללא כיתוב",
                            'url': f"https://www.instagram.com/p/{media.code}/",
                            'date': media.taken_at.strftime('%Y-%m-%d %H:%M:%S') if media.taken_at else 'תאריך לא ידוע',
                            'owner': media.user.username if media.user else 'לא ידוע',
                            'likes': media.like_count if hasattr(media, 'like_count') else 0,
                            'media_type': media.media_type,
                        }
                        saved_posts.append(post_data)
                        
                except Exception as collection_error:
                    print(f"Error fetching collection {collection.id}: {collection_error}")
                    continue
            
            if saved_posts:
                return jsonify({
                    'success': True,
                    'posts': saved_posts,
                    'message': f'נטענו {len(saved_posts)} פוסטים שמורים'
                })
            else:
                # Fallback: return sample data
                sample_posts = [
                    {
                        'shortcode': 'ABC123',
                        'caption': 'טיפים מדהימים לבישול! איך להכין פסטה מושלמת ב-5 דקות 🍝 #בישול #פסטה',
                        'url': 'https://www.instagram.com/p/ABC123/',
                        'date': '2024-01-15 14:30:00',
                        'owner': 'chef_maria',
                        'likes': 15420,
                        'media_type': 2,
                    },
                    {
                        'shortcode': 'DEF456',
                        'caption': 'שגרת אימון בוקר לאנשים עסוקים 💪 רק 10 דקות נדרשות! #כושר #אימון',
                        'url': 'https://www.instagram.com/p/DEF456/',
                        'date': '2024-01-14 08:15:00',
                        'owner': 'fitness_guru',
                        'likes': 8930,
                        'media_type': 2,
                    }
                ]
                
                return jsonify({
                    'success': True,
                    'posts': sample_posts,
                    'message': 'לא נמצאו פוסטים שמורים, מציג נתוני דמו'
                })
                
        except Exception as fetch_error:
            print(f"Error fetching saved posts: {fetch_error}")
            
            # Return sample data as fallback
            sample_posts = [
                {
                    'shortcode': 'SAMPLE1',
                    'caption': 'זהו פוסט לדוגמה - הגישה לפוסטים שמורים מוגבלת על ידי אינסטגרם',
                    'url': 'https://www.instagram.com/',
                    'date': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                    'owner': 'demo_user',
                    'likes': 100,
                    'media_type': 1,
                }
            ]
            
            return jsonify({
                'success': True,
                'posts': sample_posts,
                'message': 'הגישה לפוסטים שמורים מוגבלת. מציג נתוני דמו'
            })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'שגיאה בטעינת פוסטים: {str(e)}'
        })

@app.route('/api/search-posts', methods=['GET'])
def search_posts():
    """Search through saved posts"""
    try:
        username = request.args.get('username')
        query = request.args.get('query', '').lower()
        
        if not username or username not in clients:
            return jsonify({
                'success': False,
                'message': 'לא מחובר. אנא התחבר תחילה'
            })
        
        if not query:
            return jsonify({
                'success': False,
                'message': 'אנא הזן מילת חיפוש'
            })
        
        # First get all saved posts
        client = clients[username]
        collections = client.collections()
        all_posts = []
        
        for collection in collections[:10]:
            try:
                collection_posts = client.collection_medias(collection.id, amount=200)
                
                for media in collection_posts:
                    post_data = {
                        'shortcode': media.code,
                        'caption': media.caption_text if media.caption_text else "",
                        'url': f"https://www.instagram.com/p/{media.code}/",
                        'date': media.taken_at.strftime('%Y-%m-%d %H:%M:%S') if media.taken_at else 'תאריך לא ידוע',
                        'owner': media.user.username if media.user else 'לא ידוע',
                        'likes': media.like_count if hasattr(media, 'like_count') else 0,
                        'media_type': media.media_type,
                    }
                    all_posts.append(post_data)
                    
            except Exception as collection_error:
                print(f"Error fetching collection {collection.id}: {collection_error}")
                continue
        
        # Filter posts based on search query
        filtered_posts = []
        for post in all_posts:
            caption = post.get('caption', '').lower()
            owner = post.get('owner', '').lower()
            
            if query in caption or query in owner:
                filtered_posts.append(post)
        
        return jsonify({
            'success': True,
            'posts': filtered_posts,
            'message': f'נמצאו {len(filtered_posts)} פוסטים התואמים לחיפוש "{query}"'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'שגיאה בחיפוש: {str(e)}'
        })

@app.route('/api/user-posts/<username>', methods=['GET'])
def get_user_posts(username):
    """Get user's own posts as demo"""
    try:
        if username not in clients:
            return jsonify({
                'success': False,
                'message': 'לא מחובר. אנא התחבר תחילה'
            })
        
        client = clients[username]
        
        # Get user's own posts
        user_id = client.user_id
        user_posts = client.user_medias_v1(user_id, amount=10)
        
        formatted_posts = []
        for media in user_posts:
            post_data = {
                'shortcode': media.code,
                'caption': media.caption_text if media.caption_text else "ללא כיתוב",
                'url': f"https://www.instagram.com/p/{media.code}/",
                'date': media.taken_at.strftime('%Y-%m-%d %H:%M:%S') if media.taken_at else 'תאריך לא ידוע',
                'owner': username,
                'likes': media.like_count if hasattr(media, 'like_count') else 0,
                'media_type': media.media_type,
            }
            formatted_posts.append(post_data)
        
        return jsonify({
            'success': True,
            'posts': formatted_posts,
            'message': f'נטענו {len(formatted_posts)} פוסטים של המשתמש'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'שגיאה בטעינת פוסטי המשתמש: {str(e)}'
        })

@app.route('/api/logout', methods=['POST'])
def logout():
    """Logout user"""
    data = request.get_json()
    username = data.get('username')
    
    if username in clients:
        del clients[username]
    
    return jsonify({
        'success': True,
        'message': 'התנתקת בהצלחה'
    })

if __name__ == '__main__':
    import os
    
    # Get port from environment variable (for deployment platforms)
    port = int(os.environ.get('PORT', 5000))
    host = os.environ.get('HOST', '0.0.0.0')
    debug = os.environ.get('FLASK_ENV') != 'production'
    
    print("🚀 מפעיל שרת Instagram API...")
    print(f"🔗 השרת יפעל על: http://{host}:{port}")
    print(f"🔗 בדיקת בריאות: http://{host}:{port}/api/health")
    print("💡 לעצירת השרת: Ctrl+C")
    
    app.run(host=host, port=port, debug=debug) 