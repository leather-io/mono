import { Box, Flag, ItemLayout, Pressable, SkeletonLoader } from '@leather.io/ui/native';

export function LoadingItem() {
  return (
    <Pressable flexDirection="row" disabled={true} onPress={undefined}>
      <Flag
        img={<SkeletonLoader borderRadius="round" height={48} width={48} isLoading={true} />}
        px="5"
        py="3"
      >
        <Box>
          <ItemLayout
            gap="1"
            titleLeft={<SkeletonLoader height={16} width={139} isLoading={true} />}
            titleRight={<SkeletonLoader height={16} width={40} isLoading={true} />}
            captionLeft={<SkeletonLoader height={16} width={92} isLoading={true} />}
            captionRight={<SkeletonLoader height={16} width={40} isLoading={true} />}
          />
        </Box>
      </Flag>
    </Pressable>
  );
}
