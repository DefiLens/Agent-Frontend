import Avatar from 'boring-avatars';

const AvatarIcon = ({ address }: { address: string }) => (
  <Avatar
    square={true}
    size="100%"
    name={address}
    variant="marble"
    colors={[
      '#5566FF',
      '#eab308',
      '#16a34a',
      '#92A1C6',
      '#1f2020',
      '#F0AB3D',
      '#C271B4',
      '#C20D90',
    ]}
  />
);

export default AvatarIcon;
