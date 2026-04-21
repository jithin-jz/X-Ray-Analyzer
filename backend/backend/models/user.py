def user_helper(user) -> dict:
    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "is_verified": user.get("is_verified", False),
        "credential_id": user.get("credential_id"),
        "public_key": user.get("public_key"),
    }
