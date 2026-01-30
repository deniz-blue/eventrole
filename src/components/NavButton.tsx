import type { ButtonProps } from "discord-jsx-renderer";
import { useCallback, type PropsWithChildren } from "react";
import { useNavigate, type To } from "react-router";

export const NavButton = ({ to, children, ...props }: PropsWithChildren<{ to: To } & ButtonProps>) => {
	const navigate = useNavigate();

	const handleClick = useCallback(() => navigate(to), [navigate, to]);

	return (
		<button
			onClick={handleClick}
			{...props}
		>
			{children}
		</button>
	)
};
