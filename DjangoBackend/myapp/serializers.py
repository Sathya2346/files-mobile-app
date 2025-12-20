# myapp/serializers.py
from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    photo = serializers.SerializerMethodField()

    def get_photo(self, obj):
        request = self.context.get("request")
        if obj.photo:
            try:
                return request.build_absolute_uri(obj.photo.url)
            except Exception:
                return None
        return None

    class Meta:
        model = User
        fields = ["id", "name", "email", "phone", "bio", "location", "photo", "created_at"]
        extra_kwargs = {
            "password": {"write_only": True}
        }
