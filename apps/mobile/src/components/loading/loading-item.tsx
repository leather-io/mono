import { useSettings } from '@/store/settings/settings';
import { Image } from 'expo-image';

import { Box, Flag, ItemLayout, Pressable, SkeletonLoader } from '@leather.io/ui/native';

function LoadingAvatarIcon() {
  const { whenTheme } = useSettings();

  return (
    <Box width={48} height={48} position="relative">
      <SkeletonLoader borderRadius="round" height={48} width={48} isLoading={true} />
      <Box
        position="absolute"
        bottom={-1}
        right={-1}
        width={16}
        height={16}
        bg="ink.background-primary"
        borderRadius="round"
        alignItems="center"
        justifyContent="center"
        overflow="hidden"
      >
        {whenTheme({
          light: (
            <Image
              style={{ width: 16, height: 16 }}
              contentFit="cover"
              source={require('@/assets/spinner-light.png')}
            />
          ),
          dark: (
            <Image
              style={{ width: 16, height: 16 }}
              contentFit="cover"
              source={require('@/assets/spinner-dark.png')}
            />
          ),
        })}
      </Box>
    </Box>
  );
}

export function LoadingItem() {
  return (
    <Pressable disabled={true} onPress={undefined}>
      <Flag img={<LoadingAvatarIcon />} px="5" py="3">
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
