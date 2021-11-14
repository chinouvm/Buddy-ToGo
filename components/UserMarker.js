import { Icon } from '@iconify/react';
import locationIcon from '@iconify/icons-bx/bxs-user-pin';

const UserMarker = ({ lat, lng, onClick }) => {
  return (
    <div className="UserMarker">
      <Icon icon={locationIcon} className="locationIcon" />
    </div>
  );
};

export default UserMarker;
