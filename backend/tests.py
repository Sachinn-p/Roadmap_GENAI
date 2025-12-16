"""Unit tests for the roadmap application."""

import os
import sys
import unittest
import json
import tempfile
from unittest.mock import patch, MagicMock

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app
from models import ContentModel
from services import GeminiService, YouTubeService, FileService
from validators import validate_file_upload, validate_roadmap_response
from exceptions import ValidationError, FileProcessingError


class TestApp(unittest.TestCase):
    """Test cases for Flask application."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.app = app
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()
        
        # Mock environment variables
        self.app.config['GEMINI_API_KEY'] = 'test_key'
        self.app.config['YOUTUBE_API_KEY'] = 'test_key'
    
    def test_health_check(self):
        """Test health check endpoint."""
        response = self.client.get('/health')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['service'], 'roadmap-api')
    
    def test_get_roadmap_missing_name(self):
        """Test get roadmap without course name."""
        response = self.client.get('/api/roadmap')
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertIn('error', data)
    
    def test_get_objective_missing_name(self):
        """Test get objective without course name."""
        response = self.client.get('/getObj')
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertIn('error', data)
    
    def test_explain_text_missing_data(self):
        """Test explain text without data."""
        response = self.client.post('/explain', json={})
        self.assertEqual(response.status_code, 400)
    
    def test_translate_text_missing_data(self):
        """Test translate text without data."""
        response = self.client.post('/translate', json={})
        self.assertEqual(response.status_code, 400)


class TestValidators(unittest.TestCase):
    """Test cases for validation functions."""
    
    def test_validate_roadmap_response_valid(self):
        """Test valid roadmap response validation."""
        valid_response = {
            "roadMap": {
                "course_name": "Test Course",
                "roadmap": [
                    {
                        "unit_number": "1",
                        "unit_title": "Introduction",
                        "topics": ["Topic 1", "Topic 2"]
                    }
                ]
            }
        }
        
        result = validate_roadmap_response(json.dumps(valid_response))
        self.assertEqual(result, valid_response)
    
    def test_validate_roadmap_response_invalid_json(self):
        """Test invalid JSON roadmap response."""
        with self.assertRaises(ValidationError):
            validate_roadmap_response("invalid json")
    
    def test_validate_roadmap_response_missing_keys(self):
        """Test roadmap response with missing keys."""
        invalid_response = {"roadMap": {"course_name": "Test"}}
        
        with self.assertRaises(ValidationError):
            validate_roadmap_response(json.dumps(invalid_response))
    
    def test_validate_file_upload_no_file(self):
        """Test file upload validation with no file."""
        with self.assertRaises(ValidationError):
            validate_file_upload(None, {'pdf'})


class TestServices(unittest.TestCase):
    """Test cases for service classes."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.temp_dir = tempfile.mkdtemp()
    
    def tearDown(self):
        """Clean up test fixtures."""
        import shutil
        shutil.rmtree(self.temp_dir)
    
    def test_file_service_initialization(self):
        """Test file service initialization."""
        service = FileService(self.temp_dir, {'pdf'})
        self.assertEqual(service.upload_folder, self.temp_dir)
        self.assertEqual(service.allowed_extensions, {'pdf'})
    
    @patch('services.genai')
    def test_gemini_service_initialization(self, mock_genai):
        """Test Gemini service initialization."""
        service = GeminiService('test_key')
        mock_genai.configure.assert_called_once_with(api_key='test_key')
    
    @patch('services.requests.get')
    def test_youtube_service_search_video_success(self, mock_get):
        """Test YouTube service video search success."""
        mock_response = MagicMock()
        mock_response.json.return_value = {
            'items': [{'id': {'videoId': 'test123'}}]
        }
        mock_response.raise_for_status.return_value = None
        mock_get.return_value = mock_response
        
        service = YouTubeService('test_key')
        result = service.search_video('test topic')
        
        self.assertIn('video_url', result)
        self.assertIn('test123', result['video_url'])
    
    @patch('services.requests.get')
    def test_youtube_service_search_video_no_results(self, mock_get):
        """Test YouTube service video search with no results."""
        mock_response = MagicMock()
        mock_response.json.return_value = {'items': []}
        mock_response.raise_for_status.return_value = None
        mock_get.return_value = mock_response
        
        service = YouTubeService('test_key')
        
        with self.assertRaises(Exception):
            service.search_video('test topic')


class TestModels(unittest.TestCase):
    """Test cases for database models."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.mock_client = MagicMock()
        self.mock_db = MagicMock()
        self.mock_collection = MagicMock()
        
        self.mock_client.__getitem__.return_value = self.mock_db
        self.mock_db.__getitem__.return_value = self.mock_collection
    
    def test_content_model_initialization(self):
        """Test content model initialization."""
        model = ContentModel(self.mock_client, 'test_db', 'test_collection')
        self.assertEqual(model.client, self.mock_client)
    
    def test_content_model_create(self):
        """Test content model create method."""
        model = ContentModel(self.mock_client, 'test_db', 'test_collection')
        
        # Mock the insert and find operations
        mock_result = MagicMock()
        mock_result.inserted_id = 'test_id'
        self.mock_collection.insert_one.return_value = mock_result
        self.mock_collection.find_one.return_value = {
            '_id': 'test_id',
            'name': 'test'
        }
        
        result = model.create({'name': 'test'})
        self.assertEqual(result['_id'], 'test_id')


if __name__ == '__main__':
    unittest.main()
