from abc import ABC, abstractmethod
from collections.abc import Iterable
from dataclasses import dataclass
from typing import BinaryIO


@dataclass(frozen=True)
class StorageFile:
    id: str
    name: str
    mime_type: str
    size: int | None = None
    path: str = ""


class StorageProvider(ABC):
    @abstractmethod
    def list_files(self, folder_id: str) -> Iterable[StorageFile]:
        pass

    @abstractmethod
    def open_file(self, file_id: str) -> BinaryIO:
        pass

    @abstractmethod
    def get_file(self, file_id: str) -> StorageFile:
        pass
