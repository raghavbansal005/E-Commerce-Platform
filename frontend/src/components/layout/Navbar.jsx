import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Box,
  InputBase,
  alpha,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Search as SearchIcon,
  ShoppingCart as CartIcon,
  AccountCircle,
  Menu as MenuIcon,
  Logout,
  Person,
  ShoppingBag,
  Subscriptions,
  DarkMode,
  LightMode,
  Info,
  Analytics as AnalyticsIcon,
  Feedback as FeedbackIcon,
  Inventory as ProductsIcon,
  FavoriteOutlined as WishlistIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import { useTheme as useCustomTheme } from "../../contexts/ThemeContext";
import CartDrawer from "../cart/CartDrawer";

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
}));

const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems, toggleCart } = useCart();
  const { isDarkMode, toggleTheme } = useCustomTheme();

  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

  // Add scroll event listener with debounce
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          setIsScrolled(currentScrollY > 100 && currentScrollY > lastScrollY);
          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMobileMenuAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate("/");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const menuId = "primary-search-account-menu";
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
    >
      <MenuItem
        onClick={() => {
          navigate("/profile");
          handleMenuClose();
        }}
      >
        <Person sx={{ mr: 1 }} />
        Profile
      </MenuItem>
      <MenuItem
        onClick={() => {
          navigate("/orders");
          handleMenuClose();
        }}
      >
        <ShoppingBag sx={{ mr: 1 }} />
        Orders
      </MenuItem>
      <MenuItem
        onClick={() => {
          navigate("/subscriptions");
          handleMenuClose();
        }}
      >
        <Subscriptions sx={{ mr: 1 }} />
        Subscriptions
      </MenuItem>
      <MenuItem
        onClick={() => {
          navigate("/wishlist");
          handleMenuClose();
        }}
      >
        <WishlistIcon sx={{ mr: 1 }} />
        Wishlist
      </MenuItem>
      <MenuItem
        onClick={() => {
          navigate("/analytics");
          handleMenuClose();
        }}
      >
        <AnalyticsIcon sx={{ mr: 1 }} />
        Analytics
      </MenuItem>
      <MenuItem onClick={handleLogout}>
        <Logout sx={{ mr: 1 }} />
        Logout
      </MenuItem>
    </Menu>
  );

  const mobileMenuId = "primary-search-account-menu-mobile";
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMenuAnchorEl}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={Boolean(mobileMenuAnchorEl)}
      onClose={handleMenuClose}
    >
      <MenuItem
        onClick={() => {
          navigate("/about");
          handleMenuClose();
        }}
      >
        <Info sx={{ mr: 1 }} />
        About
      </MenuItem>
      <MenuItem
        onClick={() => {
          navigate("/products");
          handleMenuClose();
        }}
      >
        <ProductsIcon sx={{ mr: 1 }} />
        Products
      </MenuItem>
      <MenuItem
        onClick={() => {
          navigate("/feedback");
          handleMenuClose();
        }}
      >
        <FeedbackIcon sx={{ mr: 1 }} />
        Feedback
      </MenuItem>
      <MenuItem
        onClick={() => {
          toggleTheme();
          handleMenuClose();
        }}
      >
        {isDarkMode ? (
          <LightMode sx={{ mr: 1 }} />
        ) : (
          <DarkMode sx={{ mr: 1 }} />
        )}
        {isDarkMode ? "Light Mode" : "Dark Mode"}
      </MenuItem>
      {isAuthenticated
        ? [
            <MenuItem
              key="profile"
              onClick={() => {
                navigate("/profile");
                handleMenuClose();
              }}
            >
              <Person sx={{ mr: 1 }} />
              Profile
            </MenuItem>,
            <MenuItem
              key="orders"
              onClick={() => {
                navigate("/orders");
                handleMenuClose();
              }}
            >
              <ShoppingBag sx={{ mr: 1 }} />
              Orders
            </MenuItem>,
            <MenuItem
              key="subscriptions"
              onClick={() => {
                navigate("/subscriptions");
                handleMenuClose();
              }}
            >
              <Subscriptions sx={{ mr: 1 }} />
              Subscriptions
            </MenuItem>,
            <MenuItem
              key="wishlist"
              onClick={() => {
                navigate("/wishlist");
                handleMenuClose();
              }}
            >
              <WishlistIcon sx={{ mr: 1 }} />
              Wishlist
            </MenuItem>,
            <MenuItem key="logout" onClick={handleLogout}>
              <Logout sx={{ mr: 1 }} />
              Logout
            </MenuItem>,
          ]
        : [
            <MenuItem
              key="login"
              onClick={() => {
                navigate("/login");
                handleMenuClose();
              }}
            >
              Login
            </MenuItem>,
            <MenuItem
              key="register"
              onClick={() => {
                navigate("/register");
                handleMenuClose();
              }}
            >
              Register
            </MenuItem>,
          ]}
    </Menu>
  );

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          bgcolor: "primary.main",
          boxShadow: isScrolled
            ? "0 2px 8px rgba(0,0,0,0.2)"
            : "0 2px 8px rgba(0,0,0,0.1)",
          transition: "all 0.3s",
          transform: isScrolled ? "translateY(-100%)" : "translateY(0)",
          "&.scrolled": {
            transform: "translateY(0)",
            bgcolor: alpha(theme.palette.primary.main, 0.95),
            backdropFilter: "blur(8px)",
          },
        }}
        className={isScrolled ? "scrolled" : ""}
      >
        <Toolbar sx={{ minHeight: { xs: 64, sm: 70 } }}>
          {/* Logo */}
          <Typography
            variant="h6"
            noWrap
            component={Link}
            to="/"
            sx={{
              display: "flex",
              fontFamily: "Inter",
              fontWeight: 700,
              fontSize: { xs: "1.2rem", sm: "1.5rem" },
              color: "inherit",
              textDecoration: "none",
              mr: { xs: 2, sm: 4 },
              "&:hover": {
                opacity: 0.9,
              },
            }}
          >
            🛒 Subscribify
          </Typography>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: "flex", alignItems: "center", mr: 3 }}>
              <Button
                color="inherit"
                component={Link}
                to="/about"
                startIcon={<Info />}
                sx={{
                  mx: 0.5,
                  px: 3,
                  py: 1.2,
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  transition: "all 0.3s ease",
                  bgcolor:
                    location.pathname === "/about"
                      ? alpha(theme.palette.common.white, 0.2)
                      : "transparent",
                  "&:hover": {
                    bgcolor: alpha(theme.palette.common.white, 0.15),
                    transform: "translateY(-1px)",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                  },
                }}
              >
                About
              </Button>
              <Button
                color="inherit"
                component={Link}
                to="/products"
                startIcon={<ProductsIcon />}
                sx={{
                  mx: 0.5,
                  px: 3,
                  py: 1.2,
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  transition: "all 0.3s ease",
                  bgcolor:
                    location.pathname === "/products"
                      ? alpha(theme.palette.common.white, 0.2)
                      : "transparent",
                  "&:hover": {
                    bgcolor: alpha(theme.palette.common.white, 0.15),
                    transform: "translateY(-1px)",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                  },
                }}
              >
                Products
              </Button>
              {isAuthenticated && (
                <Button
                  color="inherit"
                  component={Link}
                  to="/analytics"
                  startIcon={<AnalyticsIcon />}
                  sx={{
                    mx: 0.5,
                    px: 3,
                    py: 1.2,
                    borderRadius: 3,
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    transition: "all 0.3s ease",
                    bgcolor:
                      location.pathname === "/analytics"
                        ? alpha(theme.palette.common.white, 0.2)
                        : "transparent",
                    "&:hover": {
                      bgcolor: alpha(theme.palette.common.white, 0.15),
                      transform: "translateY(-1px)",
                      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  Analytics
                </Button>
              )}
              <Button
                color="inherit"
                component={Link}
                to="/feedback"
                startIcon={<FeedbackIcon />}
                sx={{
                  mx: 0.5,
                  px: 3,
                  py: 1.2,
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  transition: "all 0.3s ease",
                  bgcolor:
                    location.pathname === "/feedback"
                      ? alpha(theme.palette.common.white, 0.2)
                      : "transparent",
                  "&:hover": {
                    bgcolor: alpha(theme.palette.common.white, 0.15),
                    transform: "translateY(-1px)",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                  },
                }}
              >
                Feedback
              </Button>
            </Box>
          )}

          {/* Search */}
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <form onSubmit={handleSearch}>
              <StyledInputBase
                placeholder="Search products..."
                inputProps={{ "aria-label": "search" }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </Search>

          <Box sx={{ flexGrow: 1 }} />

          {/* Desktop Actions */}
          {!isMobile && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {/* Wishlist */}
              {isAuthenticated && (
                <IconButton
                  size="large"
                  color="inherit"
                  component={Link}
                  to="/wishlist"
                  sx={{
                    "&:hover": {
                      bgcolor: alpha(theme.palette.common.white, 0.1),
                    },
                  }}
                >
                  <WishlistIcon />
                </IconButton>
              )}

              {/* Theme Toggle */}
              <IconButton
                size="large"
                color="inherit"
                onClick={toggleTheme}
                sx={{
                  "&:hover": {
                    bgcolor: alpha(theme.palette.common.white, 0.1),
                  },
                }}
              >
                {isDarkMode ? <LightMode /> : <DarkMode />}
              </IconButton>

              {/* Cart */}
              <IconButton
                size="large"
                color="inherit"
                onClick={toggleCart}
                sx={{
                  "&:hover": {
                    bgcolor: alpha(theme.palette.common.white, 0.1),
                  },
                }}
              >
                <Badge
                  badgeContent={totalItems}
                  color="secondary"
                  sx={{
                    "& .MuiBadge-badge": {
                      fontSize: "0.75rem",
                      minWidth: "18px",
                      height: "18px",
                    },
                  }}
                >
                  <CartIcon />
                </Badge>
              </IconButton>

              {/* Auth Actions */}
              {isAuthenticated ? (
                <IconButton
                  size="large"
                  edge="end"
                  aria-label="account of current user"
                  aria-controls={menuId}
                  aria-haspopup="true"
                  onClick={handleProfileMenuOpen}
                  color="inherit"
                  sx={{
                    ml: 1,
                    "&:hover": {
                      bgcolor: alpha(theme.palette.common.white, 0.1),
                    },
                  }}
                >
                  {user?.avatar?.url ? (
                    <Avatar
                      src={user.avatar.url}
                      sx={{ width: 32, height: 32 }}
                    />
                  ) : (
                    <AccountCircle />
                  )}
                </IconButton>
              ) : (
                <Box sx={{ display: "flex", gap: 1, ml: 1 }}>
                  <Button
                    color="inherit"
                    component={Link}
                    to="/login"
                    sx={{
                      textTransform: "none",
                      fontWeight: 500,
                      px: 2,
                      "&:hover": {
                        bgcolor: alpha(theme.palette.common.white, 0.1),
                      },
                    }}
                  >
                    Login
                  </Button>
                  <Button
                    variant="outlined"
                    color="inherit"
                    component={Link}
                    to="/register"
                    sx={{
                      textTransform: "none",
                      fontWeight: 500,
                      px: 2,
                      borderColor: alpha(theme.palette.common.white, 0.5),
                      "&:hover": {
                        borderColor: "white",
                        bgcolor: alpha(theme.palette.common.white, 0.1),
                      },
                    }}
                  >
                    Register
                  </Button>
                </Box>
              )}
            </Box>
          )}

          {/* Mobile Menu */}
          {isMobile && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton size="large" color="inherit" onClick={toggleCart}>
                <Badge
                  badgeContent={totalItems}
                  color="secondary"
                  sx={{
                    "& .MuiBadge-badge": {
                      fontSize: "0.75rem",
                      minWidth: "18px",
                      height: "18px",
                    },
                  }}
                >
                  <CartIcon />
                </Badge>
              </IconButton>
              <IconButton
                size="large"
                aria-label="show more"
                aria-controls={mobileMenuId}
                aria-haspopup="true"
                onClick={handleMobileMenuOpen}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {renderMobileMenu}
      {renderMenu}
      <CartDrawer />
      <Box sx={{ height: { xs: 64, sm: 70 } }} />
    </>
  );
};

export default Navbar;
