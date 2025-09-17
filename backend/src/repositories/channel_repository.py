from src.repositories.base_repository import BaseRepository
from src.models.channel import Channel


class ChannelRepository(BaseRepository[Channel]):
    def __init__(self):
        super().__init__(Channel)


channel_repository = ChannelRepository()



