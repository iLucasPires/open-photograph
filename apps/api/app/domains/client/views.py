from rest_framework import filters, viewsets
from rest_framework.permissions import IsAdminUser

from .models import Client
from .serializers import ClientSerializer


class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.select_related("user").all()
    serializer_class = ClientSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "email", "phone"]
    ordering_fields = ["name", "email", "created_at"]
    ordering = ["name"]
