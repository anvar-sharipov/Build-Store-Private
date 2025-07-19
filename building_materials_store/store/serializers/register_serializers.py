from rest_framework import serializers
from .. models import *
from django.contrib.auth.models import Group
# from django.contrib.auth import get_user_model
# from rest_framework.generics import ListAPIView
# from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
# from django.db import transaction
# from datetime import datetime
# from django.db.models import Sum


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)
    group = serializers.CharField(write_only=True)
    photo = serializers.ImageField(required=False)

    class Meta:
        model = User
        fields = ['username', 'password', 'password2', 'group', 'photo']

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("USERNAME_EXISTS")
        return value
    
    def validate_group(self, value):
        if not value:
            raise serializers.ValidationError("EMPTY_GROUP_NAME")
        if not Group.objects.filter(name=value).exists():
            raise serializers.ValidationError("GROUP_NOT_FOUND")
        return value
    
    def validate(self, attrs):
        # Проверка на совпадение паролей
        if attrs['password'].lower() != attrs['password2'].lower():
            raise serializers.ValidationError({"password2": "PASSWORDS_DO_NOT_MATCH"})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        group_name = validated_data.pop('group', None)
        username = validated_data.get('username').lower()
        password = validated_data.get('password').lower()

        photo = validated_data.pop('photo', None)
        # user = User.objects.create_user(**validated_data)
        user = User.objects.create_user(username=username, password=password)
        if photo:
            user.photo = photo
            user.save()

        try:
            group = Group.objects.get(name=group_name)
            user.groups.add(group)
        except Group.DoesNotExist:
            raise serializers.ValidationError({'group': 'GROUP_NOT_FOUND'})
        return user
    