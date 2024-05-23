import { Icon, IconProps, IconSmall } from './icon/icon.web';

export function EyeSlashIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <IconSmall {...props}>
        <path
          d="M6.03842 2.70791C5.64178 2.8273 5.41702 3.24561 5.5364 3.64225C5.65579 4.03889 6.0741 4.26365 6.47074 4.14426L6.03842 2.70791ZM14.5138 7.70372L13.8521 8.05676L13.8521 8.05676L14.5138 7.70372ZM12.5734 9.81279C12.2998 10.1238 12.3302 10.5977 12.6413 10.8713C12.9523 11.1448 13.4262 11.1144 13.6998 10.8034L12.5734 9.81279ZM14.5141 8.29605L13.8524 7.94305V7.94305L14.5141 8.29605ZM2.36387 1.30317C2.07097 1.01027 1.5961 1.01027 1.30321 1.30317C1.01031 1.59606 1.01031 2.07093 1.30321 2.36383L2.36387 1.30317ZM1.48626 7.70425L0.824522 7.35125L0.824522 7.35125L1.48626 7.70425ZM11.647 11.647L12.1774 11.1167L11.647 11.647ZM13.6365 14.6972C13.9294 14.9901 14.4043 14.9901 14.6972 14.6972C14.9901 14.4043 14.9901 13.9294 14.6972 13.6365L13.6365 14.6972ZM1.48694 8.29724L0.825253 8.65032H0.825253L1.48694 8.29724ZM6.99847 6.99843C7.29136 6.70554 7.29136 6.23066 6.99847 5.93777C6.70558 5.64488 6.2307 5.64488 5.93781 5.93777L6.99847 6.99843ZM10.0626 10.0626C10.3555 9.76967 10.3555 9.29479 10.0626 9.0019C9.76971 8.70901 9.29483 8.70901 9.00194 9.0019L10.0626 10.0626ZM6.47074 4.14426C9.02797 3.37457 11.98 4.54773 13.8521 8.05676L15.1755 7.35068C13.0488 3.36448 9.43407 1.68587 6.03842 2.70791L6.47074 4.14426ZM13.6998 10.8034C14.2447 10.1837 14.7408 9.46459 15.1759 8.64906L13.8524 7.94305C13.4678 8.66397 13.0364 9.28622 12.5734 9.81279L13.6998 10.8034ZM13.8521 8.05676C13.8335 8.02178 13.833 7.97946 13.8524 7.94305L15.1759 8.64906C15.3926 8.24277 15.3915 7.75553 15.1755 7.35068L13.8521 8.05676ZM1.30321 2.36383L3.82301 4.88363L4.88367 3.82297L2.36387 1.30317L1.30321 2.36383ZM2.14799 8.05725C2.88809 6.66987 3.80086 5.64887 4.78062 4.96968L3.92606 3.73691C2.72511 4.56942 1.66143 5.78239 0.824522 7.35125L2.14799 8.05725ZM3.82301 4.88363L11.1167 12.1773L12.1774 11.1167L4.88367 3.82297L3.82301 4.88363ZM11.1167 12.1773L13.6365 14.6972L14.6972 13.6365L12.1774 11.1167L11.1167 12.1773ZM0.825253 8.65032C2.1195 11.0758 3.95905 12.6524 5.99639 13.2795C8.04114 13.909 10.2089 13.5565 12.0743 12.2634L11.2198 11.0306C9.713 12.0751 8.02022 12.3331 6.4377 11.8459C4.84776 11.3565 3.29334 10.0894 2.14863 7.94416L0.825253 8.65032ZM0.824522 7.35125C0.607309 7.75843 0.609698 8.24636 0.825253 8.65032L2.14863 7.94416C2.16683 7.97826 2.16789 8.01995 2.14799 8.05725L0.824522 7.35125ZM8.0002 9.41683C7.2178 9.41683 6.58354 8.78257 6.58354 8.00016H5.08354C5.08354 9.61099 6.38937 10.9168 8.0002 10.9168V9.41683ZM6.58354 8.00016C6.58354 7.60876 6.74128 7.25562 6.99847 6.99843L5.93781 5.93777C5.41082 6.46476 5.08354 7.19496 5.08354 8.00016H6.58354ZM9.00194 9.0019C8.74475 9.25909 8.39161 9.41683 8.0002 9.41683V10.9168C8.80541 10.9168 9.53561 10.5896 10.0626 10.0626L9.00194 9.0019Z"
          fill="currentColor"
        />
      </IconSmall>
    );

  return (
    <Icon {...props}>
      <path
        d="M10.6068 4.09497C10.0596 4.16981 9.67667 4.67407 9.75151 5.22126C9.82635 5.76845 10.3306 6.15137 10.8778 6.07652L10.6068 4.09497ZM21.7554 11.5438L22.6298 11.0587V11.0587L21.7554 11.5438ZM19.5179 14.02C19.1736 14.4519 19.2447 15.081 19.6765 15.4253C20.1084 15.7695 20.7376 15.6985 21.0818 15.2666L19.5179 14.02ZM21.7555 12.4558L20.8811 11.9707V11.9707L21.7555 12.4558ZM3.7069 2.29289C3.31638 1.90237 2.68321 1.90237 2.29269 2.29289C1.90216 2.68342 1.90216 3.31658 2.29269 3.70711L3.7069 2.29289ZM14.1211 14.1213L14.8282 13.4142L14.1211 14.1213ZM20.2927 21.7071C20.6832 22.0976 21.3164 22.0976 21.7069 21.7071C22.0974 21.3166 22.0974 20.6834 21.7069 20.2929L20.2927 21.7071ZM2.24408 11.5441L3.1185 12.0292L2.24408 11.5441ZM7.18916 7.48108C7.65185 7.17953 7.78248 6.55998 7.48092 6.09729C7.17936 5.6346 6.55982 5.50398 6.09713 5.80554L7.18916 7.48108ZM2.24496 12.4576L1.3706 12.9428L1.3706 12.9428L2.24496 12.4576ZM17.9025 18.1944C18.3651 17.8928 18.4958 17.2733 18.1942 16.8106C17.8927 16.3479 17.2731 16.2173 16.8104 16.5188L17.9025 18.1944ZM10.8778 6.07652C14.4617 5.58634 18.3431 7.45518 20.881 12.029L22.6298 11.0587C19.7722 5.90858 15.161 3.47206 10.6068 4.09497L10.8778 6.07652ZM21.0818 15.2666C21.6403 14.5659 22.1588 13.7903 22.63 12.941L20.8811 11.9707C20.4612 12.7275 20.0039 13.4102 19.5179 14.02L21.0818 15.2666ZM20.881 12.029C20.8711 12.0111 20.8709 11.989 20.8811 11.9707L22.63 12.941C22.9549 12.3553 22.9546 11.6439 22.6298 11.0587L20.881 12.029ZM11.9998 14C10.8952 14 9.99979 13.1046 9.99979 12H7.99979C7.99979 14.2091 9.79065 16 11.9998 16V14ZM2.29269 3.70711L9.17137 10.5858L10.5856 9.17157L3.7069 2.29289L2.29269 3.70711ZM9.99979 12C9.99979 11.4474 10.2226 10.9488 10.5856 10.5858L9.17137 9.17157C8.4486 9.89434 7.99979 10.8957 7.99979 12H9.99979ZM9.17137 10.5858L13.414 14.8284L14.8282 13.4142L10.5856 9.17157L9.17137 10.5858ZM13.414 14.8284L20.2927 21.7071L21.7069 20.2929L14.8282 13.4142L13.414 14.8284ZM13.414 13.4142C13.051 13.7772 12.5524 14 11.9998 14V16C13.1041 16 14.1055 15.5512 14.8282 14.8284L13.414 13.4142ZM2.29269 3.70711L20.2927 21.7071L21.7069 20.2929L3.7069 2.29289L2.29269 3.70711ZM3.1185 12.0292C4.25665 9.97798 5.66794 8.47254 7.18916 7.48108L6.09713 5.80554C4.27141 6.99544 2.64678 8.75717 1.36966 11.0589L3.1185 12.0292ZM1.3706 12.9428C3.29254 16.4058 6.00363 18.6464 8.98526 19.55C11.973 20.4554 15.1472 19.9901 17.9025 18.1944L16.8104 16.5188C14.5307 18.0046 11.9662 18.3636 9.56532 17.636C7.15841 16.9066 4.83125 15.0569 3.11933 11.9723L1.3706 12.9428ZM1.36966 11.0589C1.04383 11.6461 1.04666 12.3591 1.3706 12.9428L3.11933 11.9723C3.12842 11.9887 3.12954 12.0093 3.1185 12.0292L1.36966 11.0589Z"
        fill="currentColor"
      />
    </Icon>
  );
}
